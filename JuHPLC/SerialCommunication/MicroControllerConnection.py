import _thread
import logging
import time

import datetime
import serial
import serial.tools.list_ports

from JuHPLC.models import *
from django.forms.models import model_to_dict



class MicroControllerConnection:
    """
    Offers a connection to a microcontroller that can be used for data acquisition (and maybe at a later point changing parameters)
    """

    def __init__(self, chromatogram, portname, baudrate=9600, timeout=2):
        self.logger = logging.getLogger(__name__)
        """

        :param portname:Name of the Port to be used. In Windows this could be COMX, on linux this could be a /dev/XXXX
        The user running the software needs to have access to said device
        :type portname:str
        :param baudrate:the baud rate to be used to configure the serial port. defaults to 9600
        :type baudrate:int
        """

        self.chromatogram = chromatogram

        if self.isvalidportname(portname):
            self.portname = portname
        else:
            raise ValueError("there is no serial port named " + portname)
        self.baudrate = baudrate
        self.timeout = timeout
        self.stopacquisitionflag = False

        self.serialInterface = serial.Serial(portname, baudrate, timeout=self.timeout)
        self.dataCache = {"UV":[]}

    def startacquisition(self):
        self.stopacquisitionflag = False
        self.thread = _thread.start_new_thread(self.acquisitionmethod, ())

    def stopacquisition(self):
        self.stopacquisitionflag = True

    @staticmethod
    def isvalidportname(portname):
        for tmp in serial.tools.list_ports.comports():
            if tmp.device == portname:
                return 1
        return 0


    def acquisitionmethod(self):
        self.runNumber = 0
        # Byte "x" senden, um moegliche Aktivitaeten zu stoppen
        self.serialInterface.write(b"x")
        # moegliche Sendereste abwarten
        self.serialInterface.flushInput()
        time.sleep(2)


        #rest lesen und verwerfen
        self.__throwRemainingBytesAway()

        self.setRheodyneSwitch()
        time.sleep(2)

        self.__throwRemainingBytesAway()

        self.__sendAquisitionMode()

        self.dataCache = {"UV": []}

        time.sleep(2)  # auf die ersten datensätze warten

        self.__main_loop()

        self.serialInterface.write(b"x")

    def __sendAquisitionMode(self):
        if self.chromatogram.SampleRate == 1:
            self.serialInterface.write(b"c")
        else:
            self.serialInterface.write(b"C" + bytes(str(self.chromatogram.SampleRate), 'ascii'))

    def __throwRemainingBytesAway(self):
        if self.serialInterface.inWaiting() > 0:
            # rest lesen und verwerfen
            self.serialInterface.read(self.serialInterface.inWaiting())

    def setRheodyneSwitch(self):
        if self.chromatogram.RheodyneSwitch:
            self.serialInterface.write(b"m")
            self.serialInterface.flushInput()
            time.sleep(1.5)
            res = self.serialInterface.read(1).decode("utf-8")
            if res == "m":
                self.serialInterface.write(b"t")
                self.serialInterface.flushInput()
        else:
            self.serialInterface.write(b"m")
            self.serialInterface.flushInput()
            time.sleep(1.5)
            res = self.serialInterface.read(1).decode("utf-8")
            if res == "s":
                self.serialInterface.write(b"t")
                self.serialInterface.flushInput()


    def __main_loop(self):
        buffer = ''
        currentdatetime = 0
        zyklusAlt = 1
        tmpList = []
        while self.stopacquisitionflag == False:
            inbuff = self.serialInterface.inWaiting()
            # ab hier python3 fix, da sonst zu schnell daten gelesen werden und inWaiting immer 0 zurück gibt
            if inbuff == 0:
                time.sleep(0.33)
                # ende python3 fix
            while '\n' not in buffer:
                buffer = buffer + self.serialInterface.read(1).decode("utf-8")
            if '\n' in buffer:  # genau dann ist eine Messreihe übertragen
                zyklus, zeitInMin, analogSignal, counts = buffer.split(',', 3)

                if (int(zyklus) < int(zyklusAlt)):
                    zyklusAlt = 1
                    self.runNumber = self.runNumber + 1
                    previd = self.chromatogram.pk
                    self.chromatogram.pk = None
                    self.chromatogram.Comment = self.chromatogram.Comment.split('|')[0] + "|Run:" + str(self.runNumber)
                    self.chromatogram.Datetime = datetime.datetime.now().timestamp()
                    currentdatetime = 0
                    self.chromatogram.save()
                    prev = Chromatogram.objects.get(pk=previd)
                    prev.NextChromatogram = self.chromatogram.pk
                    prev.save()

                    self.dataCache = {"UV": []}

                zyklusAlt = int(zyklus)

                # do db save here
                data1 = HplcData()
                data1.Chromatogram = self.chromatogram
                data1.Value = analogSignal
                data1.Datetime = currentdatetime
                data1.ChannelName = "UV"
                tmpList.append(data1)
                self.dataCache["UV"].append(model_to_dict(data1))

                if self.chromatogram.AcquireADC:
                    data2 = HplcData()
                    data2.Chromatogram = self.chromatogram
                    data2.Value = counts
                    data2.Datetime = currentdatetime
                    data2.ChannelName = "Counter"
                    tmpList.append(data2)
                    if "Counter" not in self.dataCache:
                        self.dataCache["Counter"] = []
                    self.dataCache["Counter"].append(model_to_dict(data2))

                buffer = ''
                currentdatetime += 1

                # so we dont lock the db too long
                # insert the first 10 values directly so we can show a graph that will refresh itself afterwards
                if len(tmpList) >= 10 or int(zyklus) < 10:
                    HplcData.objects.bulk_create(tmpList)
                    tmpList = []
                if self.chromatogram.MaxRuntime != 0 and int(zyklus) / (
                        60.0 * self.chromatogram.SampleRate) > self.chromatogram.MaxRuntime:
                    # not using import here to not have cyclic references, as these tend to cause problems
                    JuHPLC.SerialCommunication.MicroControllerManager.MicroControllerManager.getinstance().stopacquisitionforchromatogram(
                        self.chromatogram)
        # persist data at the end
        HplcData.objects.bulk_create(tmpList)
