from django.urls import path
from .views import ShoppingListView, ShoppingListDetailView, ShoppingItemCreateView

urlpatterns = [
    path('lists/', ShoppingListView.as_view(), name='shopping-list'),
    path('lists/<int:id>/', ShoppingListDetailView.as_view(), name='shopping-list-detail'),
    path('items/', ShoppingItemCreateView.as_view(), name='shopping-item-create'),
]
