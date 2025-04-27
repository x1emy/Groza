# lists/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ListConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.list_id = self.scope['url_route']['kwargs']['list_id']
        self.room_group_name = f'list_{self.list_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data['action']
        item = data['item']

        # Отправляем всем в группе (включая отправителя)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_action',
                'action': action,
                'item': item
            }
        )

    async def send_action(self, event):
        await self.send(text_data=json.dumps({
            'action': event['action'],
            'item': event['item']
        }))