import json
import logging
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from groza_list.models import ShoppingList, ShoppingItem
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)

class ListConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Логируем попытку подключения
        self.list_id = self.scope['url_route']['kwargs']['list_id']
        logger.debug(f"Attempting to connect to list {self.list_id}")
        self.room_group_name = f'list_{self.list_id}'
        
        # Извлекаем list_id из URL, преобразуем его в UUID
        try:
            self.list_id = uuid.UUID(self.scope['url_route']['kwargs']['list_id'])
        except ValueError:
            logger.error(f"Invalid list_id format: {self.scope['url_route']['kwargs']['list_id']}")
            await self.close()
            return

        self.room_group_name = f'list_{self.list_id}'

        # Проверка, существует ли список покупок с таким list_id
        try:
            self.shopping_list = await database_sync_to_async(ShoppingList.objects.get)(id=self.list_id)
        except ShoppingList.DoesNotExist:
            # Если список не найден, отклоняем подключение
            await self.close()
            return  # Важно завершить метод здесь

        # Добавляем канал в группу
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Логируем разрыв соединения
        logger.debug(f"Disconnected from list {self.list_id}")
        
        # Удаляем канал из группы при отключении
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Логируем полученные данные
        logger.debug(f"Received data: {text_data}")
        
        # Парсим входящие данные
        data = json.loads(text_data)

        action = data.get('action')

        if action == 'update':
            item_id = data['item_id']
            is_purchased = data['is_purchased']

            try:
                shopping_item = await database_sync_to_async(ShoppingItem.objects.get)(id=item_id)
                shopping_item.is_purchased = is_purchased
                await database_sync_to_async(shopping_item.save)()
            except ShoppingItem.DoesNotExist:
                pass

        elif action == 'add':
            name = data.get('name')
            if name:
                await database_sync_to_async(ShoppingItem.objects.create)(
                    shopping_list=self.shopping_list,
                    name=name,
                    is_purchased=False
                )

        elif action == 'delete':
            item_id = data.get('item_id')
            try:
                shopping_item = await database_sync_to_async(ShoppingItem.objects.get)(id=item_id)
                await database_sync_to_async(shopping_item.delete)()
            except ShoppingItem.DoesNotExist:
                pass

        # Отправляем обновленные данные всем клиентам в группе
        updated_items = await database_sync_to_async(lambda: list(self.shopping_list.shopping_items.all()))()
        updated_items_data = [
            {
                'id': item.id,
                'name': item.name,
                'is_purchased': item.is_purchased
            }
            for item in updated_items
        ]

        # Отправляем обновление всем в группе
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'list_message',
                'data': updated_items_data
            }
        )

    async def list_message(self, event):
        # Отправляем обновление всем клиентам в группе
        await self.send(text_data=json.dumps(event['data']))
