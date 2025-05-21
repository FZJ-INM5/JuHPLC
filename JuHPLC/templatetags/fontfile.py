import base64
from typing import Any
from django import template
from WebApp import settings

register = template.Library()

@register.simple_tag
def fontfile(inputfile: str, name: str) -> str:
    with open(settings.STATIC_ROOT+inputfile.split('/static', 1)[1],"rb") as inputfileptr:
        content = inputfileptr.read()
        base64data = "".join(map(chr, base64.encodebytes(content)))
        tmp = "@font-face {    font-family: '"+name+"';    src: url(data:application/x-font-woff;charset=utf-8;base64,"+base64data+") format('woff');    font-weight: normal;    font-style: normal;}"
        return '<style>'+tmp+'</style>'


