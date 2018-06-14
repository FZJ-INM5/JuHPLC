"""import graphene

from JuHPLC.models import Chromatogram,Eluent,HplcData,Solvent

from graphene.types.datetime import DateTime
from graphene_django.filter import DjangoFilterConnectionField
from graphene_django.types import DjangoObjectType
from graphene import AbstractType, Node
from graphene.relay import *

import datetime
from graphene.types import Scalar
from graphql.language import ast


class DateTime(Scalar):
    '''DateTime Scalar Description'''

    @staticmethod
    def serialize(dt):
        return dt.isoformat()

    @staticmethod
    def parse_literal(node):
        if isinstance(node, ast.StringValue):
            return datetime.datetime.strptime(
                node.value, "%Y-%m-%dT%H:%M:%S.%f")

    @staticmethod
    def parse_value(value):
        return datetime.datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%f")


class CustomNode(Node):

    class Meta:
        name = 'Node'

    @staticmethod
    def to_global_id(type, id):
        return str(type)+":"+str(id)

    @staticmethod
    def from_global_id(global_id):
        '''
        Takes the "global ID" created by toGlobalID, and retuns the type name and ID
        used to create it.
        '''
        _type, _id = global_id.split(':', 1)
        return _type, _id


class ChromatogramType(DjangoObjectType):
    class Meta:
        model = Chromatogram
        filter_fields = {"id": ["lt","gt","exact"],
                         "Sample": ["exact"],
                         "Column": ["exact"],
                         "Datetime": ["lt", "gt", "exact"],
                         "Flow": ["exact"],
                         "UVWavelength": ["exact"],
                         "InjectionVolume": ["exact"],
                         "Concentration": ["exact"],
                         "Comment": ["exact"],
                         "AcquireADC": ["exact"]}

        interfaces = (Node, )

class HplcDataType(DjangoObjectType):
    class Meta:
        model = HplcData
        filter_fields = {"Chromatogram": ["lt", "gt", "exact"],
                         "ChannelName": ["exact"],
                         "Datetime": ["lt", "gt", "exact"],
                         "Value": ["lt", "gt", "exact"],
                         "id":["lt", "gt", "exact"]}

        interfaces = (Node,)

class QueryType(graphene.ObjectType):

    chromatogram = Node.Field(ChromatogramType)
    all_chromatograms = DjangoFilterConnectionField(ChromatogramType)

    hplc = Node.Field(HplcDataType)
    all_hplcdata = DjangoFilterConnectionField(HplcDataType)

    def resolve_hello(self, args, context, info):
        return 'World'


    def resolve_chromatogram(self,args,context,info):
        id = args.get('id')
        dt = args.get('datetime')



        if id is not None:
            return Chromatogram.objects.get(pk=id)

        if dt is not None:
            return Chromatogram.objects.get(Datetime=dt)

        return None


schema = graphene.Schema(query=QueryType)
"""
