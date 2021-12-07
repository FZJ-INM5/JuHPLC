from channels.routing import ProtocolTypeRouter

from django.conf.urls import url
from JuHPLC import consumers
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

from JuHPLC import ThinClientConsumers


websocket_urlpatterns = [
    url(r'^ws/JuHPLC/ChromatogramDetails/(?P<id>[^/]+)/$', consumers.JuHPLCConsumer.as_asgi()),
    url(r'^ws/JuHPLC/ThinClient/$', ThinClientConsumers.ThinClientConsumer.as_asgi())
]

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})