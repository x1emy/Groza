from django.urls import path, re_path
from .views import (
    ShoppingListView,
    ShoppingListDetailView,
    ShoppingItemCreateView,
    generate_ai_list
)

urlpatterns = [
    path('lists/', ShoppingListView.as_view(), name='shopping-list'),
    re_path(r'^lists/(?P<pk>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/$', 
           ShoppingListDetailView.as_view(), 
           name='shopping-list-detail'),
    path('items/', ShoppingItemCreateView.as_view(), name='shopping-item-create'),
    path('generate-ai/', generate_ai_list, name='generate-ai-list'),
]