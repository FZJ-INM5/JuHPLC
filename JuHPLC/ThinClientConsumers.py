import datetime

from channels.generic.websocket import AsyncWebsocketConsumer
import json

from django.forms import model_to_dict

from JuHPLC.models import Chromatogram, Peak, Marker, HplcData


class ThinClientConsumer(AsyncWebsocketConsumer):

    clients = {}

    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({
            'message': "Please Register with fqdn + ports",
            'type': 'registrationRequest'
        }))

    async def disconnect(self, close_code):
        ThinClientConsumer.clients.pop(self.fqdn)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        # send the new deadtime to everyone except the sender
        if text_data_json['type'] == 'registration':
            self.fqdn = text_data_json['fqdn']
            self.ports = text_data_json['ports']
            ThinClientConsumer.clients[self.fqdn] = self.ports
            await self.channel_layer.group_add(
                self.fqdn,
                self.channel_name
            )
            await self.send(text_data=json.dumps({
                'message': "Registered Successfully!",
                'type': 'registrationResult'
            }))

        if text_data_json['type'] == 'data':
            print("DATA RECEIVED FROM THINCLIENT")
            print(text_data_json)
            chromatogram = Chromatogram.objects.get(pk=int(text_data_json['chromatogram']))
            while chromatogram.NextChromatogram != 0:
                chromatogram=Chromatogram.objects.get(pk=chromatogram.NextChromatogram)
            data1 = HplcData()
            data1.Chromatogram = chromatogram
            data1.Value = text_data_json['value']
            data1.Datetime = text_data_json['datetime']
            data1.ChannelName = text_data_json['channelName']
            data1.save()

            await self.channel_layer.group_send("ChromatogramDetails_%d" % chromatogram.pk, {
                'message': model_to_dict(data1),
                'type': 'hplc.data'
            })

        if text_data_json['type'] == 'nextChromatogram':
            print("nextChromatogram")
            print(text_data_json)
            chromatogram = Chromatogram.objects.get(pk=int(text_data_json['chromatogram']))
            while chromatogram.NextChromatogram != 0:
                chromatogram=Chromatogram.objects.get(pk=chromatogram.NextChromatogram)
            runNumber = int(text_data_json['runnumber'])
            chromatogram.pk = None
            chromatogram.Comment = chromatogram.Comment.split('|')[0] + "|Run:" + str(runNumber)
            chromatogram.Datetime = datetime.datetime.now().timestamp()
            chromatogram.save()
            prev = Chromatogram.objects.get(pk=int(text_data_json['chromatogram']))
            while prev.NextChromatogram != 0:
                chromatogram=Chromatogram.objects.get(pk=prev.NextChromatogram)
            prev.NextChromatogram = chromatogram.pk
            prev.save()

            newchromatogram = chromatogram

            await self.send(text_data=json.dumps({
                'message': {'id':chromatogram.pk,'portname':text_data_json['portname']},
                'type': 'nextChromatogram'
            }))

            chromatogram = Chromatogram.objects.get(pk=int(text_data_json['chromatogram']))
            while chromatogram.NextChromatogram != 0 and chromatogram.NextChromatogram != newchromatogram.pk:
                chromatogram = Chromatogram.objects.get(pk=chromatogram.NextChromatogram)
            await self.channel_layer.group_send("ChromatogramDetails_%d" % chromatogram.pk, {
                'message': {'id': newchromatogram.pk},
                'type': 'hplc.nextChromatogram'
            })

    async def hplc_startMeasurement(self, message):
        await self.send(json.dumps(message))

    async def hplc_stopMeasurement(self, message):
        await self.send(json.dumps(message))