import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WebApp.settings")
django.setup()

import unittest
from django.http import HttpRequest
from JuHPLC.HelperClass import HelperClass

class HelperClassTests(unittest.TestCase):
    def test_get_client_ip_from_forwarded(self):
        req = HttpRequest()
        req.META['HTTP_X_FORWARDED_FOR'] = '1.2.3.4,5.6.7.8'
        self.assertEqual(HelperClass.get_client_ip(req), '1.2.3.4')

    def test_get_client_ip_remote_addr(self):
        req = HttpRequest()
        req.META['REMOTE_ADDR'] = '9.8.7.6'
        self.assertEqual(HelperClass.get_client_ip(req), '9.8.7.6')

    def test_islocalhost_always_true(self):
        self.assertTrue(HelperClass.islocalhost(HttpRequest()))

if __name__ == '__main__':
    unittest.main()
