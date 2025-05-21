from typing import Any

from django import template
from WebApp import settings

register = template.Library()

@register.simple_tag
def cssfile(inputfile: str, export: bool) -> str:
    if not export:
        return "<link rel=\"stylesheet\" href=\""+inputfile+"\">"
    else:
        with open(settings.STATIC_ROOT+inputfile.split('/static', 1)[1]) as inputfileptr:
            content = inputfileptr.read()
            return '<style>'+content+'</style>'


