import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WebApp.settings")
django.setup()

import unittest
import sys
from django.http import HttpRequest
from JuHPLC.Views.NewChromatogram import serial_ports, checkAccess
from JuHPLC.HelperClass import HelperClass

class DummySerial:
    def __init__(self):
        self.closed = False
    def close(self):
        self.closed = True

class DummySerialModule:
    def __init__(self):
        self.created = []
    def Serial(self, port, timeout=1):
        self.created.append(port)
        return DummySerial()

class NewChromatogramTests(unittest.TestCase):
    def test_serial_ports_windows(self):
        sys.platform = 'win32'
        import serial
        serial.Serial = DummySerialModule().Serial
        ports = serial_ports()
        self.assertIn('COM1', ports)

    def test_serial_ports_linux(self):
        sys.platform = 'linux'
        import glob, serial
        glob.glob = lambda pattern: ['/dev/ttyUSB0']
        serial.Serial = DummySerialModule().Serial
        ports = serial_ports()
        self.assertEqual(ports, ['/dev/ttyUSB0'])

    def test_check_access(self):
        req = HttpRequest()
        HelperClass.islocalhost = staticmethod(lambda r: True)
        checkAccess(req)
        HelperClass.islocalhost = staticmethod(lambda r: False)
        with self.assertRaises(Exception):
            checkAccess(req)

if __name__ == '__main__':
    unittest.main()
