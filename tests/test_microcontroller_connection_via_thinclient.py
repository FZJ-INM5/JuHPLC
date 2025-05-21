import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WebApp.settings')
django.setup()

import unittest
from JuHPLC.SerialCommunication.MicroControllerConnectionViaThinclient import MicroControllerConnectionViaThinclient

class DummyChannelLayer:
    def __init__(self):
        self.sent = []
    async def group_send(self, name, message):
        self.sent.append((name, message))

class DummyChrom:
    def __init__(self):
        self.pk = 1
        self.SampleRate = 5
        self.RheodyneSwitch = True

class MicroControllerConnectionViaThinclientTests(unittest.TestCase):
    def setUp(self):
        self.channel = DummyChannelLayer()
        self.chrom = DummyChrom()
        self.conn = MicroControllerConnectionViaThinclient(self.chrom, 'host', 'port', channel_layer=self.channel)

    def test_build_messages(self):
        start_msg = self.conn._build_start_message()
        stop_msg = self.conn._build_stop_message()
        self.assertEqual(start_msg['id'], 1)
        self.assertEqual(start_msg['samplerate'], 5)
        self.assertTrue(start_msg['rheodyneswitch'])
        self.assertEqual(stop_msg, {'port': 'port', 'type': 'hplc.stopMeasurement'})

    def test_start_and_stop_acquisition_send_messages(self):
        self.conn.startacquisition()
        self.conn.stopacquisition()
        self.assertEqual(self.channel.sent[0][0], 'host')
        self.assertEqual(self.channel.sent[0][1]['type'], 'hplc.startMeasurement')
        self.assertEqual(self.channel.sent[1][1]['type'], 'hplc.stopMeasurement')

if __name__ == '__main__':
    unittest.main()
