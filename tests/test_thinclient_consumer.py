import os
import django
import unittest
import asyncio
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WebApp.settings')
django.setup()

from JuHPLC.ThinClientConsumers import ThinClientConsumer


class DummyChannelLayer:
    async def group_add(self, name, channel):
        pass

    async def group_send(self, name, message):
        pass


class ThinClientConsumerConnectionTests(unittest.TestCase):
    def setUp(self):
        ThinClientConsumer.clients.clear()
        self.consumer = ThinClientConsumer()
        self.consumer.channel_layer = DummyChannelLayer()
        self.sent_messages = []

        async def fake_accept(subprotocol=None):
            return

        async def fake_send(text_data=None, bytes_data=None, close=False):
            if text_data is not None:
                self.sent_messages.append(json.loads(text_data))

        self.consumer.accept = fake_accept
        self.consumer.send = fake_send

    def test_connect_and_disconnect_without_registration(self):
        asyncio.run(self.consumer.connect())
        self.assertEqual(self.sent_messages[0]['type'], 'registrationRequest')
        asyncio.run(self.consumer.disconnect(100))
        self.assertEqual(ThinClientConsumer.clients, {})


if __name__ == '__main__':
    unittest.main()
