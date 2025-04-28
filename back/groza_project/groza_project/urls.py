from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from groza_list.views import generate_ai_list

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('groza_list.urls')),
    path('api/ai/generate', generate_ai_list, name='generate_ai_list'),
    path('', TemplateView.as_view(template_name='index2.html'), name='home'),  
]
