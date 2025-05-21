import websocket
import socket
try:
    import thread
except ImportError:
    import _thread as thread
import time
import json
import serial
import serial.tools.list_ports


import _thread
import logging
import time

import datetime
import serial
import serial.tools.list_ports


class MicroControllerConnection:
    """
    Offers a connection to a microcontroller that can be used for data acquisition (and maybe at a later point changing parameters)
    """

    def __init__(self, chromatogramid, samplerate, rheodyneswitch, portname,ws, baudrate=9600, timeout=2):
        """

        :param portname:Name of the Port to be used. In Windows this could be COMX, on linux this could be a /dev/XXXX
        The user running the software needs to have access to said device
        :type portname:str
        :param baudrate:the baud rate to be used to configure the serial port. defaults to 9600
        :type baudrate:int
        """

        self.chromatogram = chromatogramid
        self.samplerate = samplerate
        self.rheodyneswitch = rheodyneswitch
        self.ws = ws

        if self.isvalidportname(portname):
            self.portname = portname
        else:
            raise ValueError("there is no serial port named " + portname)
        self.baudrate = baudrate
        self.timeout = timeout
        self.stopacquisitionflag = False

        self.prefix = self.portname.split('/')[-1]

        self.prefixChannelName = True

        self.serialInterface = serial.Serial(portname, baudrate, timeout=self.timeout)

    def startacquisition(self):
        self.stopacquisitionflag = False
        self.thread = _thread.start_new_thread(self.acquisitionmethod,())

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

        time.sleep(2)  # auf die ersten datensätze warten

        self.__main_loop()

        self.serialInterface.write(b"x")

    def __sendAquisitionMode(self):
        if self.samplerate == 1:
            self.serialInterface.write(b"c")
        elif self.chromatogram.SampleRate >= 1000:
            self.serialInterface.write(b"W" + bytes(str(self.samplerate), 'ascii'))
        else:
            self.serialInterface.write(b"C" + bytes(str(self.samplerate), 'ascii'))

    def __throwRemainingBytesAway(self):
        if self.serialInterface.inWaiting() > 0:
            # rest lesen und verwerfen
            self.serialInterface.read(self.serialInterface.inWaiting())

    def setRheodyneSwitch(self):
        if self.rheodyneswitch:
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

    def setChromatogram(self,c):
        self.chromatogram=c

    def __main_loop(self):
        buffer = ''
        currentdatetime = 0
        zyklusAlt = 1
        while self.stopacquisitionflag == False:
            inbuff = self.serialInterface.inWaiting()
            # ab hier python3 fix, da sonst zu schnell daten gelesen werden und inWaiting immer 0 zurück gibt
            if inbuff == 0:
                time.sleep(0.33)
                # ende python3 fix
            while '\n' not in buffer:
                buffer = buffer + self.serialInterface.read(1).decode("utf-8")
            if '\n' in buffer:  # genau dann ist eine Messreihe übertragen
                zyklus, zeitInMin,uv, counts = buffer.split(',', 3)

                if (int(zyklus) < int(zyklusAlt)):
                    zyklusAlt = 1
                    print("nextChromatogram")
                    self.runNumber = self.runNumber + 1
                    currentdatetime = 0
                    ws.send(json.dumps(
                        {'type':'nextChromatogram',
                         'chromatogram':self.chromatogram,
                         'runnumber':self.runNumber,
                         'portname':self.portname}))

                zyklusAlt = int(zyklus)

                # do db save here
                data1 = {'type': 'data'}

                data1['chromatogram'] = self.chromatogram
                data1['value'] = counts.strip()
                data1['datetime'] = currentdatetime
                data1['channelName'] = "Counter"
                if self.prefixChannelName:
                    data1['channelName'] = self.prefix+data1['channelName']
                ws.send(json.dumps(data1))

                data2 = {'type': 'data'}

                data2['chromatogram'] = self.chromatogram
                data2['value'] = uv
                data2['datetime'] = currentdatetime
                data2['channelName'] = "UV"
                if self.prefixChannelName:
                    data2['channelName'] = self.prefix + data2['channelName']
                ws.send(json.dumps(data2))

                buffer = ''
                currentdatetime += 1


connections = {}

def on_message(ws, message):
    print(message)
    text_data_json = json.loads(message)

    if text_data_json['type'] == 'registrationRequest':
        ports = []

        for i in serial.tools.list_ports.comports():
            ports.append(i.device+" - "+i.description)

        response = json.dumps(
            {'type': 'registration',
             'ports': ports,
             'fqdn': socket.getfqdn()
             }
        )
        print("sending response:")
        print(response)
        ws.send(response)

    if text_data_json['type'] == 'registrationResult':
        print("Registration Result:")
        print(text_data_json['message'])

    if text_data_json['type'] == 'hplc.stopMeasurement':
        print("hplc.stopMeasurement")
        if text_data_json['port'] in connections:
            connections[text_data_json['port']].stopacquisition()
            connections.pop(text_data_json['port'])

    if text_data_json['type'] == 'hplc.startMeasurement':
        print("hplc.startMeasurement")
        portname = text_data_json['port']
        baudrate = text_data_json['baudrate']

        con = MicroControllerConnection(text_data_json['id'],
                                  text_data_json['samplerate'],
                                  text_data_json['rheodyneswitch'],
                                  portname,
                                  ws,
                                  baudrate,
                                  2)
        connections[portname] = con
        con.startacquisition()

    if text_data_json['type'] == 'nextChromatogram':
        print("nextChromatogram ID is")
        print(text_data_json['message']['id'])
        print(connections[text_data_json['message']['portname']].chromatogram)
        connections[text_data_json['message']['portname']].setChromatogram(int(text_data_json['message']['id']))
        print(connections[text_data_json['message']['portname']].chromatogram)

        

def on_error(ws, error):
    print(error)


def on_close(ws):
    print("### closed ###")


def on_open(ws):
    def run(*args):
        while True:
            time.sleep(1)
        #ws.close()
        print("thread terminating...")
    thread.start_new_thread(run, ())


if __name__ == "__main__":
    while True:
        time.sleep(1)
        try:
            websocket.enableTrace(False)
            ws = websocket.WebSocketApp("ws://hplc.inc-forschung.kfa-juelich.de/ws/JuHPLC/ThinClient/",
                                      on_message=on_message,
                                      on_error=on_error,
                                      on_close=on_close)
            ws.on_open = on_open
            ws.run_forever()
        except Exception as ex:
            logging.exception("exception, restarting connection to server")
