from accounts.authenticate import CustomAuthentication
from rest_framework import generics, status
from rest_framework.permissions import SAFE_METHODS
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from .models import Subrabbit
from .permissions import IsAuthenticatedOrReadOnly
from .serializers import SubrabbitSerializer, SubrabbitSerializer_detailed

# from rest_framework.response import Response
# from rest_framework import serializers


class SubrabbitListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [CustomAuthentication]
    queryset = Subrabbit.objects.all().order_by('-created_at')

    # Apply authentication to unsafe HTTP methods
    def get_authenticators(self):
        if self.request.method in SAFE_METHODS:
            return []
        return super().get_authenticators()

    # Dynamically select serializer based on HTTP method
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SubrabbitSerializer_detailed
        elif self.request.method == 'POST':
            return SubrabbitSerializer

    # Override perform_create to add additional fields
    def perform_create(self, serializer):
        serializer.save(
            creator=self.request.user,
            subscribers=[self.request.user],
            moderators=[self.request.user]
        )

    # Override create to handle validation errors
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

        except ValidationError as e:
            return self.handle_validation_error(e)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data['name'], status=status.HTTP_201_CREATED, headers=headers)
    
    # Method to handle validation errors
    def handle_validation_error(self, e):
        if 'unique' in e.detail['name'][0].code:
            error_message = {
                "title": "A subrabbit with this name already exists.", 
                "detail": "Please choose a different subrabbit name"
            }
            return Response({"message": [error_message]}, status=status.HTTP_409_CONFLICT)
        elif 'min_length' in e.detail['name'][0].code:
            return Response(e.detail, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        else:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
