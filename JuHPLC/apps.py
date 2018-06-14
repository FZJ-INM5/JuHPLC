from __future__ import unicode_literals

from django.apps import AppConfig





class JuhplcConfig(AppConfig):
    name = 'JuHPLC'
    verbose_name = name

    def ready(self):
        pass