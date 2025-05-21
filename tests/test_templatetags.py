import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WebApp.settings")
django.setup()

import unittest
from JuHPLC.templatetags.cssfile import cssfile
from JuHPLC.templatetags.javascriptfile import javascriptfile
from JuHPLC.templatetags.fontfile import fontfile
from JuHPLC.templatetags.fromunix import fromunix
from datetime import datetime
import builtins

class DummyOpen:
    def __init__(self, data: bytes):
        self.data = data
    def __call__(self, *args, **kwargs):
        from io import StringIO, BytesIO
        mode = kwargs.get('mode', 'r')
        if len(args) >= 2:
            mode = args[1]
        if 'b' in mode:
            return BytesIO(self.data)
        return StringIO(self.data.decode())

class TemplateTagTests(unittest.TestCase):
    def test_cssfile_read(self):
        builtins.open = DummyOpen(b'body{}')
        res = cssfile('/static/style.css', True)
        self.assertIn('<style>body{}', res)

    def test_cssfile_link(self):
        res = cssfile('/static/style.css', False)
        self.assertIn('href="/static/style.css"', res)

    def test_javascriptfile(self):
        builtins.open = DummyOpen(b'alert(1);')
        res = javascriptfile('/static/script.js', True)
        self.assertIn('<script>alert(1);', res)

    def test_fontfile(self):
        builtins.open = DummyOpen(b'abc')
        res = fontfile('/static/font.woff', 'f')
        self.assertIn('@font-face', res)

    def test_fromunix(self):
        self.assertIsInstance(fromunix(0), datetime)

if __name__ == '__main__':
    unittest.main()
