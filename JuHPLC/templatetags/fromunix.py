from datetime import datetime
from django import template
from WebApp import settings

register = template.Library()


@register.filter(name='fromunix')
def fromunix(value):
    return datetime.fromtimestamp(value)
