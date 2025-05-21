from typing import Dict, List, Optional

from JuHPLC.SerialCommunication.MicroControllerConnection import MicroControllerConnection
from JuHPLC.SerialCommunication.MicroControllerConnectionViaThinclient import MicroControllerConnectionViaThinclient


class MicroControllerManager:

    instance: Optional["MicroControllerManager"] = None

    def __init__(self) -> None:
        self.activeConnections: Dict[str, any] = {}

    def startacquisition(self, chromatogram: any, portname: str) -> None:
        if portname not in self.activeConnections:
            if len(portname.split(' - ')) == 2:
                con = MicroControllerConnection(chromatogram, portname.split(' - ')[0])
            else:
                con = MicroControllerConnectionViaThinclient(chromatogram,portname.split(' - ')[0],portname.split(' - ')[1])
            self.activeConnections[portname] = con
            con.startacquisition()
            return

        raise Exception("Already an acquisiton active on port "+portname+" for chromatogram "+str(self.activeConnections[portname].chromatogram.id))

    def getConnectionForChromatogramID(self, chromatogramid: int) -> Optional[any]:
        for i in self.activeConnections:
            if self.activeConnections[i].chromatogram.id == int(chromatogramid):
                return self.activeConnections[i]
        return None

    def getAllConnectionsForChromatogramID(self, chromatogramid: int) -> Optional[List[any]]:
        res: List[any] = []
        for i in self.activeConnections:
            if self.activeConnections[i].chromatogram.id == int(chromatogramid):
                res.append(self.activeConnections[i])

        if len(res) > 0:
            return res
        return None

    def stopacquisitionforchromatogram(self, chromatogram: any) -> bool:
        for i in self.activeConnections:
            if self.activeConnections[i].chromatogram == chromatogram:
                self.activeConnections[i].stopacquisition()
                del self.activeConnections[i]
                return False
        return True


    def stopacquisitionforportname(self, portname: str) -> None:
        self.activeConnections[portname].stopacquisition()
        del self.activeConnections[portname]

    def chromatogramhasactiveacquisition(self, chromatogram: any) -> bool:
        for i in self.activeConnections:
            if self.activeConnections[i].chromatogram == chromatogram:
                return True

        return False

    def getactivechromatogramids(self) -> List[int]:
        result: List[int] = []
        for i in self.activeConnections:
            result.append(self.activeConnections[i].chromatogram.id)
        return result

    @staticmethod
    def getinstance() -> "MicroControllerManager":
        """
        :return: MicroControllerManager
        :rtype: MicroControllerManager
        """
        if MicroControllerManager.instance is None:
            MicroControllerManager.instance = MicroControllerManager()
        return MicroControllerManager.instance
