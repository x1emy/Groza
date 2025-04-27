from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from .models import ShoppingList, ShoppingItem
from .serializers import ShoppingListSerializer, ShoppingItemSerializer
from django.shortcuts import render

def index(request):
    return render(request, 'index2.html')

# Для создания и отображения списка покупок
class ShoppingListView(generics.ListCreateAPIView):
    queryset = ShoppingList.objects.all()
    serializer_class = ShoppingListSerializer

    def perform_create(self, serializer):
        # Создаем новый список покупок без необходимости переопределять create()
        serializer.save()

class ShoppingListDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ShoppingList.objects.all()
    serializer_class = ShoppingListSerializer
    lookup_field = 'id'

# Для создания товара в списке покупок
class ShoppingItemCreateView(generics.CreateAPIView):
    queryset = ShoppingItem.objects.all()
    serializer_class = ShoppingItemSerializer

    def perform_create(self, serializer):
        list_id = self.request.data.get('list_id')
        
        try:
            shopping_list = ShoppingList.objects.get(id=list_id)
        except ShoppingList.DoesNotExist:
            raise NotFound("Shopping list with the given ID does not exist.")
        
        serializer.save(list=shopping_list)
