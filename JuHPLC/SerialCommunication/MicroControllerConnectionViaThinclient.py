from channels.layers import get_channel_layer
from asgiref.sync import AsyncToSync


class MicroControllerConnectionViaThinclient:
    """
    Offers a connection to a microcontroller that can be used for data acquisition (and maybe at a later point changing parameters)
    """

    def __init__(self, chromatogram, hostname, portname, baudrate=9600, timeout=2):
        self.channel_layer = get_channel_layer()
        self.chromatogram = chromatogram
        self.hostname = hostname
        self.portname=portname
        self.baudrate=baudrate
        self.timeout=timeout


    def startacquisition(self):
        AsyncToSync(self.channel_layer.group_send)(self.hostname, {
            'id': self.chromatogram.pk,
            'baudrate': self.baudrate,
            'port': self.portname,
            'samplerate': self.chromatogram.SampleRate,
            'rheodyneswitch':self.chromatogram.RheodyneSwitch,
            'type': 'hplc.startMeasurement'
        })

    def stopacquisition(self):
        AsyncToSync(self.channel_layer.group_send)(self.hostname, {
            'port': self.portname,
            'type': 'hplc.stopMeasurement'
        })
