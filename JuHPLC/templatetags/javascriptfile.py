from django import template
from WebApp import settings

register = template.Library()

@register.simple_tag
def javascriptfile(inputfile, export):
    if not export:
        return "<script src=\""+inputfile+"\"></script>"
    else:
        with open(settings.STATIC_ROOT+inputfile.split('/static', 1)[1]) as inputfileptr:
            content = inputfileptr.read()
            return '<script>'+content+'</script>'


