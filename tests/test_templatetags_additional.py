import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','WebApp.settings')
django.setup()

import unittest
from JuHPLC.templatetags.javascriptfile import javascriptfile

class JavaScriptTagExtraTests(unittest.TestCase):
    def test_javascriptfile_link(self):
        res = javascriptfile('/static/test.js', False)
        self.assertIn('<script src="/static/test.js"', res)

if __name__ == '__main__':
    unittest.main()
