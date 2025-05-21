import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WebApp.settings")
django.setup()

import unittest
from JuHPLC.SerialCommunication.MicroControllerConnection import MicroControllerConnection

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

class MicroControllerConnectionTests(unittest.TestCase):
    def test_isvalidportname(self):
        class Port:
            def __init__(self, device):
                self.device = device
        import serial.tools.list_ports
        serial.tools.list_ports.comports = lambda: [Port('A'), Port('B')]
        self.assertTrue(MicroControllerConnection.isvalidportname('B'))
        self.assertFalse(MicroControllerConnection.isvalidportname('C'))

    def test_send_aquisition_mode(self):
        chrom = DummyChrom(500)
        import serial
        serial.Serial = lambda *a, **k: DummySerial()
        MicroControllerConnection.isvalidportname = staticmethod(lambda port: True)
        conn = MicroControllerConnection(chrom, 'A')
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
