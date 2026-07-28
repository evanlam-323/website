#!/usr/bin/env python3
"""Static file server + trimmer upload endpoint for the Evan Lam portfolio.

Use this instead of `python -m http.server` so the Video Trimmer can save clips
straight into the site with no download / no folder picking:

    python serve.py            # http://localhost:8123
    python serve.py 8137       # custom port

On top of normal static serving it adds three routes:
  GET  /upload-ping           -> {"ok": true, "ffmpeg": <bool>}  (capability probe)
  POST /upload/<project-id>   -> writes the request body to
                                 videos/<project-id>/<name>  (name from the
                                 X-Filename header). The site auto-scans
                                 videos/<project>/, so the clip appears on that
                                 project page after a refresh.
  POST /trim                  -> ffmpeg-cuts the selection out of an uploaded
                                 source (params in X-Start/X-End/X-Fps/X-Scale/
                                 X-Bitrate/X-Audio/X-Ext headers) and returns the
                                 trimmed .webm bytes. Instant, no foreground tab
                                 needed; replaces the browser's real-time export.
                                 Needs ffmpeg on PATH (winget install Gyan.FFmpeg).

Safety: bound to 127.0.0.1 (localhost only); known project ids and video
extensions only; 300 MB cap. All responses are sent no-store so edited JS and
freshly-added videos always load fresh (no cache-buster juggling locally).
"""
import sys
import os
import re
import glob
import json
import shutil
import tempfile
import subprocess
import http.server
import socketserver

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
ROOT = os.path.dirname(os.path.abspath(__file__))
PROJECTS = {
    'uh88-weather', 'rose-arm', 'mini-bridge', 'steel-bridge',
    'soma-pump', 'stair-robot', 'kealakehe', 'personal',
}
MAX_BYTES = 300 * 1024 * 1024              # 300 MB upload cap
SAFE = re.compile(r'[^A-Za-z0-9._-]')
VIDEO_EXT = ('.webm', '.mp4', '.mov', '.m4v')
SRC_EXT = ('.mp4', '.mov', '.m4v', '.webm', '.ogv', '.ogg', '.avi', '.mkv')

_FFMPEG = None


def find_ffmpeg():
    """Locate ffmpeg. Prefers PATH; falls back to winget install dirs so a
    just-installed ffmpeg works even before the terminal's PATH is refreshed.
    Positive results are cached; a missing result is re-checked each call so
    installing ffmpeg mid-run is picked up without a full restart."""
    global _FFMPEG
    if _FFMPEG and os.path.exists(_FFMPEG):
        return _FFMPEG
    ff = shutil.which('ffmpeg')
    if not ff:
        base = os.path.join(os.environ.get('LOCALAPPDATA', ''),
                            'Microsoft', 'WinGet', 'Packages')
        hits = (glob.glob(os.path.join(base, 'Gyan.FFmpeg*', '**', 'ffmpeg.exe'), recursive=True)
                + glob.glob(os.path.join(base, 'BtbN.FFmpeg*', '**', 'ffmpeg.exe'), recursive=True))
        ff = hits[0] if hits else None
    _FFMPEG = ff
    return ff


class Handler(http.server.SimpleHTTPRequestHandler):
    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.split('?')[0] == '/upload-ping':
            return self._json(200, {'ok': True, 'ffmpeg': bool(find_ffmpeg())})
        return super().do_GET()

    def do_POST(self):
        path = self.path.split('?')[0]
        if path == '/trim':
            return self.do_TRIM()
        m = re.match(r'^/upload/([a-z0-9-]+)/?$', path)
        if not m:
            return self._json(404, {'ok': False, 'error': 'not an upload route'})
        project = m.group(1)
        if project not in PROJECTS:
            return self._json(400, {'ok': False, 'error': 'unknown project'})
        try:
            length = int(self.headers.get('Content-Length', 0))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BYTES:
            return self._json(413, {'ok': False, 'error': 'missing or too-large body'})
        name = os.path.basename(self.headers.get('X-Filename', '') or 'clip.webm')
        name = SAFE.sub('-', name) or 'clip.webm'
        if not name.lower().endswith(VIDEO_EXT):
            name += '.webm'
        data = self.rfile.read(length)
        dest_dir = os.path.join(ROOT, 'videos', project)
        os.makedirs(dest_dir, exist_ok=True)
        with open(os.path.join(dest_dir, name), 'wb') as f:
            f.write(data)
        return self._json(200, {'ok': True, 'path': 'videos/%s/%s' % (project, name)})

    def do_TRIM(self):
        """Cut + re-encode the selection out of an uploaded source with ffmpeg
        and return the trimmed .webm bytes. Instant (not real-time) and needs no
        foreground/visible tab — unlike the browser's MediaRecorder fallback.

        Request: raw source-file bytes in the body; params in headers —
          X-Start, X-End (seconds) · X-Fps · X-Scale (480|720|1080|orig)
          X-Bitrate (bits/s) · X-Audio (mute|keep) · X-Ext (source extension)
        Response: video/webm bytes on success, or JSON {ok:false,error,detail}.
        """
        ff = find_ffmpeg()
        if not ff:
            return self._json(501, {'ok': False, 'error': 'ffmpeg not installed'})
        try:
            length = int(self.headers.get('Content-Length', 0))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BYTES:
            return self._json(413, {'ok': False, 'error': 'missing or too-large body'})

        def num(header, default):
            try:
                return float(self.headers.get(header, default))
            except (TypeError, ValueError):
                return default

        start = max(0.0, num('X-Start', 0))
        dur = max(0.05, num('X-End', 0) - start)
        fps = int(num('X-Fps', 30)) or 30
        scale = (self.headers.get('X-Scale') or 'orig').strip()
        bitrate = int(num('X-Bitrate', 4000000)) or 4000000
        keep_audio = (self.headers.get('X-Audio') or 'mute').strip() == 'keep'
        ext = ('.' + (self.headers.get('X-Ext') or 'mp4').lstrip('.')).lower()
        if ext not in SRC_EXT:
            ext = '.mp4'

        data = self.rfile.read(length)
        fd, in_path = tempfile.mkstemp(suffix=ext, prefix='trim-src-')
        os.close(fd)
        out_path = in_path + '.out.webm'
        try:
            with open(in_path, 'wb') as f:
                f.write(data)
            args = [ff, '-y', '-hide_banner', '-ss', '%.3f' % start,
                    '-i', in_path, '-t', '%.3f' % dur, '-r', str(fps)]
            if scale in ('480', '720', '1080'):
                m = int(scale)
                args += ['-vf', 'scale=w=%d:h=%d:force_original_aspect_ratio'
                         '=decrease:force_divisible_by=2' % (m, m)]
            args += ['-c:v', 'libvpx-vp9', '-b:v', str(bitrate), '-row-mt', '1',
                     '-cpu-used', '3', '-deadline', 'good', '-pix_fmt', 'yuv420p']
            args += (['-c:a', 'libopus', '-b:a', '128k'] if keep_audio else ['-an'])
            args += ['-f', 'webm', out_path]
            try:
                proc = subprocess.run(args, capture_output=True, timeout=600)
            except subprocess.TimeoutExpired:
                return self._json(500, {'ok': False, 'error': 'ffmpeg timed out'})
            if proc.returncode != 0 or not os.path.exists(out_path):
                tail = proc.stderr.decode('utf-8', 'replace')[-1500:]
                return self._json(500, {'ok': False, 'error': 'ffmpeg failed',
                                        'detail': tail})
            with open(out_path, 'rb') as f:
                out = f.read()
        finally:
            for p in (in_path, out_path):
                try:
                    os.remove(p)
                except OSError:
                    pass
        self.send_response(200)
        self.send_header('Content-Type', 'video/webm')
        self.send_header('Content-Length', str(len(out)))
        self.end_headers()
        self.wfile.write(out)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')   # always serve fresh
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write('%s - %s\n' % (self.address_string(), fmt % args))


def main():
    os.chdir(ROOT)
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(('127.0.0.1', PORT), Handler) as httpd:
        print('Serving %s on http://localhost:%d  (POST /upload/<project> to add videos)'
              % (ROOT, PORT))
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nstopped')


if __name__ == '__main__':
    main()
