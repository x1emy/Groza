import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from groza_project.ai_service import generate_list  

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
        try:
            data = json.loads(text_data)
            action = data.get('action')

            if action == 'generate_ai':
                prompt = data.get('prompt', '')

                items = generate_list(prompt)


                await self.send(text_data=json.dumps({
                    'type': 'ai_response',
                    'items': items
                }))
            else:
                item = data.get('item')

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'list_action',
                        'action': action,
                        'item': item
                    }
                )
        except Exception as e:
            print(f"WebSocket error: {e}")

    async def list_action(self, event):
        await self.send(text_data=json.dumps(event))

    async def ai_response(self, event):
        await self.send(text_data=json.dumps(event))
