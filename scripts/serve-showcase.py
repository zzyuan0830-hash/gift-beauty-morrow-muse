from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
os.chdir(Path(__file__).resolve().parents[1] / '.release-work/showcase/out')
class Handler(SimpleHTTPRequestHandler):
    def do_POST(self): self.send_error(404)
    def log_message(self, *_args): pass
    def send_error(self, code, message=None, explain=None):
        if code == 404:
            body = Path('404.html').read_bytes()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            if self.command != 'HEAD': self.wfile.write(body)
        else: super().send_error(code, message, explain)
ThreadingHTTPServer(('127.0.0.1', 4395), Handler).serve_forever()
