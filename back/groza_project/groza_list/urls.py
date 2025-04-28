from django.urls import path
from .views import generate_ai_list
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('ai/generate', generate_ai_list, name='generate_ai_list'),
]
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)