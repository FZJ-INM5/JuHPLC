from datetime import datetime
from typing import Union
from django import template
from WebApp import settings

register = template.Library()


@register.filter(name='fromunix')
def fromunix(value: Union[int, float]) -> datetime:
    return datetime.fromtimestamp(value)
