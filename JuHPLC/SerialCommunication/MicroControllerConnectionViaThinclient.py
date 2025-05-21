from typing import Any, Dict, Optional

from channels.layers import get_channel_layer
from asgiref.sync import AsyncToSync


class MicroControllerConnectionViaThinclient:
    """
    Offers a connection to a microcontroller that can be used for data acquisition (and maybe at a later point changing parameters)
    """

    def __init__(self, chromatogram: Any, hostname: str, portname: str, baudrate: int = 9600, timeout: int = 2,
                 channel_layer: Optional[Any] = None) -> None:
        self.channel_layer = channel_layer or get_channel_layer()
        self.chromatogram = chromatogram
        self.hostname = hostname
        self.portname=portname
        self.baudrate=baudrate
        self.timeout=timeout

    def _build_start_message(self) -> Dict[str, Any]:
        return {
            'id': self.chromatogram.pk,
            'baudrate': self.baudrate,
            'port': self.portname,
            'samplerate': self.chromatogram.SampleRate,
            'rheodyneswitch': self.chromatogram.RheodyneSwitch,
            'type': 'hplc.startMeasurement'
        }

    def _build_stop_message(self) -> Dict[str, Any]:
        return {
            'port': self.portname,
            'type': 'hplc.stopMeasurement'
        }

    def startacquisition(self) -> None:
        AsyncToSync(self.channel_layer.group_send)(self.hostname, self._build_start_message())

    def stopacquisition(self) -> None:
        AsyncToSync(self.channel_layer.group_send)(self.hostname, self._build_stop_message())
