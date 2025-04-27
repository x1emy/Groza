# В routing.py
from django.urls import re_path
from groza_project.consumers import ListConsumer

websocket_urlpatterns = [
    re_path(r'ws/lists/(?P<list_id>[^/]+)/$', ListConsumer.as_asgi()),
]
# В этом коде мы используем регулярное выражение для захвата list_id из URL.