from rest_framework import generics
from .models import Subrabbit
from .serializers import SubrabbitSerializer
# from rest_framework.response import Response
# from rest_framework import serializers


class SubrabbitListCreateView(generics.ListCreateAPIView):
    serializer_class = SubrabbitSerializer
    queryset = Subrabbit.objects.all().order_by('-created_at')
    # permission_classes = [IsAuthenticatedOrReadOnly]
