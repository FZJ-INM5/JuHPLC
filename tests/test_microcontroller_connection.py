import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WebApp.settings")
django.setup()

import unittest
from JuHPLC.SerialCommunication.MicroControllerConnection import MicroControllerConnection
from types import SimpleNamespace

class DummySerial:
    def __init__(self):
        self.written = []
    def write(self, data):
        self.written.append(data)
    def inWaiting(self):
        return 0
    def read(self, n=1):
        return b''

class DummyChrom:
    def __init__(self, rate):
        self.SampleRate = rate
        self.RheodyneSwitch = False
        self.AcquireADC = False
        self.pk = 1
        self.Comment = ''
        self.Datetime = 0
        self.MaxRuntime = 0

class DummySerialModule:
    def __init__(self, ports=None):
        self.created = []
        ports = ports or []
        self.tools = SimpleNamespace(list_ports=SimpleNamespace(comports=lambda: [SimpleNamespace(device=p) for p in ports]))

    def Serial(self, *a, **k):
        self.created.append(a[0] if a else None)
        return DummySerial()

class MicroControllerConnectionTests(unittest.TestCase):
    def test_isvalidportname(self):
        dummy_serial = DummySerialModule(['A', 'B'])
        self.assertTrue(MicroControllerConnection.isvalidportname('B', serial_module=dummy_serial))
        self.assertFalse(MicroControllerConnection.isvalidportname('C', serial_module=dummy_serial))

    def test_send_aquisition_mode(self):
        chrom = DummyChrom(500)
        dummy_serial = DummySerialModule(['A'])
        conn = MicroControllerConnection(chrom, 'A', serial_module=dummy_serial)
        conn.serialInterface = DummySerial()
        conn._MicroControllerConnection__sendAquisitionMode()
        self.assertEqual(conn.serialInterface.written, [b'C500'])

        chrom.SampleRate = 1
        conn.serialInterface.written.clear()
        conn._MicroControllerConnection__sendAquisitionMode()
        self.assertEqual(conn.serialInterface.written, [b'c'])

        chrom.SampleRate = 2000
        conn.serialInterface.written.clear()
        conn._MicroControllerConnection__sendAquisitionMode()
        self.assertEqual(conn.serialInterface.written, [b'W2000'])

if __name__ == '__main__':
    unittest.main()
