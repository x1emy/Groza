# В routing.py
from django.urls import re_path
from groza_project.consumers import ListConsumer

websocket_urlpatterns = [
    re_path(r'ws/list/(?P<list_id>[a-f0-9-]+)/$', ListConsumer.as_asgi()),  # Совпадает с форматом UUID
]
# В этом коде мы используем регулярное выражение для захвата list_id из URL.