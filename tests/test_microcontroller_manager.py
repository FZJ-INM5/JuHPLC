import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WebApp.settings")
django.setup()

import unittest
from JuHPLC.SerialCommunication.MicroControllerManager import MicroControllerManager

class DummyConnection:
    def __init__(self, chromatogram, port):
        self.chromatogram = chromatogram
        self.port = port
        self.started = False
    def startacquisition(self):
        self.started = True
    def stopacquisition(self):
        self.started = False

class DummyConnectionViaThinclient(DummyConnection):
    def __init__(self, chromatogram, host, port):
        super().__init__(chromatogram, port)
        self.host = host

class DummyChrom:
    def __init__(self, cid):
        self.id = cid

class MicroControllerManagerTests(unittest.TestCase):
    def setUp(self):
        self.manager = MicroControllerManager.getinstance()
        self.manager.activeConnections.clear()

    def test_manager_lifecycle(self):
        import JuHPLC.SerialCommunication.MicroControllerManager as mm
        mm.MicroControllerConnection = DummyConnection
        mm.MicroControllerConnectionViaThinclient = DummyConnectionViaThinclient

        chrom = DummyChrom(1)
        self.manager.startacquisition(chrom, 'COM1 - desc')
        self.assertTrue(self.manager.getConnectionForChromatogramID(1).started)
        self.assertTrue(self.manager.chromatogramhasactiveacquisition(chrom))
        self.assertEqual(self.manager.getactivechromatogramids(), [1])

        self.manager.stopacquisitionforchromatogram(chrom)
        self.assertFalse(self.manager.activeConnections)

        self.manager.startacquisition(chrom, 'host - port - remote')
        self.assertIsInstance(self.manager.getConnectionForChromatogramID(1), DummyConnectionViaThinclient)
        self.manager.stopacquisitionforportname('host - port - remote')
        self.assertFalse(self.manager.activeConnections)

    def test_get_all_connections_and_duplicate_start(self):
        import JuHPLC.SerialCommunication.MicroControllerManager as mm
        mm.MicroControllerConnection = DummyConnection
        mm.MicroControllerConnectionViaThinclient = DummyConnectionViaThinclient

        chrom = DummyChrom(2)

        # starting two different ports for the same chromatogram
        self.manager.startacquisition(chrom, 'COM1 - desc')
        self.manager.startacquisition(chrom, 'COM2 - desc')

        conns = self.manager.getAllConnectionsForChromatogramID(2)
        self.assertEqual(len(conns), 2)

        # starting again on an already used port should raise
        with self.assertRaises(Exception):
            self.manager.startacquisition(chrom, 'COM1 - desc')

        # cleanup
        self.manager.stopacquisitionforportname('COM1 - desc')
        self.manager.stopacquisitionforportname('COM2 - desc')

if __name__ == '__main__':
    unittest.main()
