from django.urls import path
from .views import ShoppingListView, ShoppingListDetailView, ShoppingItemCreateView
from django.urls import re_path

urlpatterns = [
    path('lists/', ShoppingListView.as_view(), name='shopping-list'),
    re_path(r'^lists/(?P<pk>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/$', 
           ShoppingListDetailView.as_view(), 
           name='shopping-list-detail'),
    path('items/', ShoppingItemCreateView.as_view(), name='shopping-item-create'),
]