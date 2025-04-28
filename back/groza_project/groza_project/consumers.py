# lists/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .ai_service import huggingface_service
from groza_project.ai_service import generate_shopping_list
from groza_project.ai_service import huggingface_service

class ListConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.list_id = self.scope['url_route']['kwargs']['list_id']
        self.room_group_name = f'list_{self.list_id}'
    
        # Разрешаем все соединения (для разработки)
        await self.accept()
    
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
    )

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
                items = await database_sync_to_async(huggingface_service.generate_list)(prompt)
                
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
