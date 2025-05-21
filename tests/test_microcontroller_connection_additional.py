import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WebApp.settings")
django.setup()

import unittest
from unittest.mock import patch
from JuHPLC.SerialCommunication.MicroControllerConnection import MicroControllerConnection
from types import SimpleNamespace

class DummySerial:
    def __init__(self, read_values=None):
        self.written = []
        self.read_values = list(read_values or [])
    def write(self, data):
        self.written.append(data)
    def flushInput(self):
        pass
    def inWaiting(self):
        return len(self.read_values)
    def read(self, n=1):
        out = b''
        for _ in range(n):
            if self.read_values:
                out += self.read_values.pop(0).encode()
        return out

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

class MicroControllerConnectionAdditionalTests(unittest.TestCase):
    def test_throw_remaining_bytes_away(self):
        chrom = DummyChrom(1)
        dummy_serial = DummySerialModule(['A'])
        conn = MicroControllerConnection(chrom, 'A', serial_module=dummy_serial)
        ser = DummySerial(['x','y'])
        conn.serialInterface = ser
        conn._MicroControllerConnection__throwRemainingBytesAway()
        self.assertEqual(ser.read_values, [])

    def test_set_rheodyne_switch(self):
        chrom = DummyChrom(1)
        dummy_serial = DummySerialModule(['A'])
        conn = MicroControllerConnection(chrom, 'A', serial_module=dummy_serial)
        chrom.RheodyneSwitch = True
        ser = DummySerial(['m'])
        conn.serialInterface = ser
        conn.setRheodyneSwitch()
        self.assertEqual(ser.written, [b'm', b't'])

        chrom.RheodyneSwitch = False
        ser = DummySerial(['s'])
        conn.serialInterface = ser
        conn.setRheodyneSwitch()
        self.assertEqual(ser.written, [b'm', b't'])

    def test_start_and_stop_acquisition_flags(self):
        chrom = DummyChrom(1)
        dummy_serial = DummySerialModule(['A'])
        conn = MicroControllerConnection(chrom, 'A', serial_module=dummy_serial)
        conn.serialInterface = DummySerial()
        with patch('JuHPLC.SerialCommunication.MicroControllerConnection._thread.start_new_thread') as mock_start:
            conn.startacquisition()
            mock_start.assert_called_once()
            self.assertFalse(conn.stopacquisitionflag)
        conn.stopacquisition()
        self.assertTrue(conn.stopacquisitionflag)

if __name__ == '__main__':
    unittest.main()
