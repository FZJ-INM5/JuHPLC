import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WebApp.settings')
django.setup()

import unittest
from JuHPLC.SerialCommunication.MicroControllerConnection import MicroControllerConnection
from types import SimpleNamespace

class DummySerial:
    def __init__(self, in_waiting=0, read_byte=b''):
        self.written = []
        self.in_waiting = in_waiting
        self.read_byte = read_byte
        self.flushed = False
        self.read_called = 0
    def write(self, data):
        self.written.append(data)
    def inWaiting(self):
        return self.in_waiting
    def read(self, n=1):
        self.read_called = n
        return self.read_byte
    def flushInput(self):
        self.flushed = True

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
    def __init__(self, ports=None, dummy=None):
        self.created = []
        self.dummy = dummy or DummySerial()
        ports = ports or []
        self.tools = SimpleNamespace(list_ports=SimpleNamespace(comports=lambda: [SimpleNamespace(device=p) for p in ports]))
    def Serial(self, *a, **k):
        self.created.append(a[0] if a else None)
        return self.dummy

class MicroControllerConnectionAdditionalTests(unittest.TestCase):
    def test_throw_remaining_bytes(self):
        chrom = DummyChrom(1)
        dummy_serial = DummySerialModule(['A'], DummySerial(in_waiting=3))
        conn = MicroControllerConnection(chrom, 'A', serial_module=dummy_serial)
        conn.serialInterface = dummy_serial.dummy
        conn._MicroControllerConnection__throwRemainingBytesAway()
        self.assertEqual(dummy_serial.dummy.read_called, 3)

    def test_set_rheodyne_switch_true(self):
        chrom = DummyChrom(1)
        chrom.RheodyneSwitch = True
        dummy_serial = DummySerialModule(['A'], DummySerial(in_waiting=1, read_byte=b'm'))
        conn = MicroControllerConnection(chrom, 'A', serial_module=dummy_serial)
        conn.serialInterface = dummy_serial.dummy
        conn.setRheodyneSwitch()
        self.assertIn(b'm', conn.serialInterface.written)
        self.assertIn(b't', conn.serialInterface.written)
        self.assertTrue(conn.serialInterface.flushed)

    def test_set_rheodyne_switch_false(self):
        chrom = DummyChrom(1)
        chrom.RheodyneSwitch = False
        dummy_serial = DummySerialModule(['A'], DummySerial(in_waiting=1, read_byte=b's'))
        conn = MicroControllerConnection(chrom, 'A', serial_module=dummy_serial)
        conn.serialInterface = dummy_serial.dummy
        conn.setRheodyneSwitch()
        self.assertIn(b'm', conn.serialInterface.written)
        self.assertIn(b't', conn.serialInterface.written)
        self.assertTrue(conn.serialInterface.flushed)

    def test_start_and_stop_acquisition(self):
        chrom = DummyChrom(1)
        dummy_serial = DummySerialModule(['A'])
        conn = MicroControllerConnection(chrom, 'A', serial_module=dummy_serial)
        called = {}
        def fake_start(func, args):
            called['func'] = func
            called['args'] = args
            return 1
        conn.acquisitionmethod = lambda: called.setdefault('ran', True)
        import _thread
        orig = _thread.start_new_thread
        _thread.start_new_thread = fake_start
        try:
            conn.startacquisition()
        finally:
            _thread.start_new_thread = orig
        self.assertFalse(conn.stopacquisitionflag)
        self.assertIs(called['func'], conn.acquisitionmethod)
        conn.stopacquisition()
        self.assertTrue(conn.stopacquisitionflag)

if __name__ == '__main__':
    unittest.main()
