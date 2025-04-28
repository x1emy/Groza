from rest_framework import serializers
from .models import ShoppingList, ShoppingItem

class ShoppingItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingItem
        fields = ['id', 'name', 'is_purchased', 'list'] 

class ShoppingListSerializer(serializers.ModelSerializer):
    items = ShoppingItemSerializer(many=True, read_only=True)

    class Meta:
        model = ShoppingList
        fields = ['id', 'name', 'created_at', 'updated_at', 'items'] 