#!/usr/bin/env python3
"""Static file server + trimmer upload endpoint for the Evan Lam portfolio.

Use this instead of `python -m http.server` so the Video Trimmer can save clips
straight into the site with no download / no folder picking:

    python serve.py            # http://localhost:8123
    python serve.py 8137       # custom port

On top of normal static serving it adds two routes:
  GET  /upload-ping           -> {"ok": true}          (trimmer capability probe)
  POST /upload/<project-id>   -> writes the request body to
                                 videos/<project-id>/<name>  (name from the
                                 X-Filename header). The site auto-scans
                                 videos/<project>/, so the clip appears on that
                                 project page after a refresh.

Safety: bound to 127.0.0.1 (localhost only); known project ids and video
extensions only; 300 MB cap. All responses are sent no-store so edited JS and
freshly-added videos always load fresh (no cache-buster juggling locally).
"""
import sys
import os
import re
import json
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
            return self._json(200, {'ok': True})
        return super().do_GET()

    def do_POST(self):
        m = re.match(r'^/upload/([a-z0-9-]+)/?$', self.path.split('?')[0])
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
