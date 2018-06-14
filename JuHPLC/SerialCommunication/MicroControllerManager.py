from JuHPLC.SerialCommunication.MicroControllerConnection import MicroControllerConnection


class MicroControllerManager:

    instance = None

    def __init__(self):
        self.activeConnections = {}
        pass

    def startacquisition(self, chromatogram, portname):
        if portname not in self.activeConnections:
            con = MicroControllerConnection(chromatogram, portname)
            self.activeConnections[portname] = con
            con.startacquisition()
            return

        raise Exception("Already an acquisiton active on port "+portname+" for chromatogram "+str(self.activeConnections[portname].chromatogram.id))

    def getConnectionForChromatogramID(self,chromatogramid):
        for i in self.activeConnections:
            if self.activeConnections[i].chromatogram.id == int(chromatogramid):
                return self.activeConnections[i]
        return None

    def stopacquisitionforchromatogram(self,chromatogram):
        for i in self.activeConnections:
            if self.activeConnections[i].chromatogram == chromatogram:
                self.activeConnections[i].stopacquisition()
                del self.activeConnections[i]
                return


    def stopacquisitionforportname(self, portname):
        self.activeConnections[portname].stopacquisition()
        del self.activeConnections[portname]

    def chromatogramhasactiveacquisition(self,chromatogram):
        for i in self.activeConnections:
            if self.activeConnections[i].chromatogram == chromatogram:
                return True

        return False

    def getactivechromatogramids(self):
        result = []
        for i in self.activeConnections:
            result.append(self.activeConnections[i].chromatogram.id)
        return result

    @staticmethod
    def getinstance():
        """
        :return: MicroControllerManager
        :rtype: MicroControllerManager
        """
        if MicroControllerManager.instance is None:
            MicroControllerManager.instance = MicroControllerManager()
        return MicroControllerManager.instance
