from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('groza_list.urls')),
     path('', TemplateView.as_view(template_name='index2.html'), name='home'),  # Добавить маршрут для домашней страницы
]
