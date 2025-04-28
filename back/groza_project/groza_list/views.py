import json
import os
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# Убедитесь, что импорты ведут на правильные модули
# Убраны дублирующиеся импорты
from groza_project.ai_service import huggingface_service


class ListConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.list_id = self.scope['url_route']['kwargs']['list_id']
        self.room_group_name = f'list_{self.list_id}'

        # Добавлена проверка аутентификации
        if not self.scope["user"].is_authenticated:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            item = data.get('item')

            if not action or not item:
                raise ValueError("Invalid data format")

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'list_action',
                    'action': action,
                    'item': item
                }
            )
        except (json.JSONDecodeError, ValueError) as e:
            await self.send(text_data=json.dumps({
                'error': str(e)
            }))

    async def list_action(self, event):
        await self.send(text_data=json.dumps({
            'action': event['action'],
            'item': event['item']
        }))


@csrf_exempt
@api_view(['POST'])
@csrf_exempt
@api_view(['POST'])
def generate_ai_list(request):
    try:
        # Проверка данных
        if not request.data or 'prompt' not in request.data:
            return Response(
                {"error": "Prompt is required"},
                status=status.HTTP_400_BAD_REQUEST,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:4200",
                    "Access-Control-Allow-Credentials": "true"
                }
            )

        prompt = request.data['prompt'].strip()
        items = huggingface_service.generate_list(prompt)
        
        response = Response({
            "items": items,
            "model": os.getenv("HF_MODEL_NAME", "default-model"),
            "source": "huggingface"
        })
        
        # Явное указание CORS заголовков
        response["Access-Control-Allow-Origin"] = "http://localhost:4200"
        response["Access-Control-Allow-Credentials"] = "true"
        return response

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:4200",
                "Access-Control-Allow-Credentials": "true"
            }
        )