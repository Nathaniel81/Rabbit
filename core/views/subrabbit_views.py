from accounts.authenticate import CustomAuthentication
from django.db.models import Count
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from core.models import Subrabbit
from core.permissions import IsAuthenticatedOrReadOnly
from core.serializers import SubrabbitSerializer, SubrabbitSerializer_detailed


class SubrabbitListCreateView(generics.ListCreateAPIView):
    """
    API view to list and create subrabbits.

    GET: Returns a list of subrabbits.
    POST: Creates a new subrabbit.

    - For GET requests, returns detailed information.
    - For POST requests, validates input and creates a new subrabbit.
    """

    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [CustomAuthentication]
    queryset = Subrabbit.objects.annotate(num_members=Count('subscribers')) \
                             .order_by('-num_members', '-created_at')[:5]

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
        # Check if the error detail contains information about a unique constraint violation
        if 'unique' in e.detail['name'][0].code:
           # Extract the unique constraint violation key and check if it matches
           # the error code indicating a unique constraint violation
            error_message = {
                "title": "A subrabbit with this name already exists.", 
                "detail": "Please choose a different subrabbit name"
            }
            return Response({"message": [error_message]}, status=status.HTTP_409_CONFLICT)
        elif 'min_length' in e.detail['name'][0].code:
            return Response(e.detail, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        else:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

class SubrabbitDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API view for retrieving, updating, or deleting a Subrabbit instance.

    This view allows retrieving detailed information about a Subrabbit instance via a GET request,
    updating information of a Subrabbit via PUT or PATCH requests, and deleting a Subrabbit via a DELETE request.

    Requires authentication for updating or deleting operations.
    """

    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [CustomAuthentication]
    queryset = Subrabbit.objects.all()
    lookup_field = 'name'

    # Return the appropriate serializer class based on the HTTP method of the request.
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SubrabbitSerializer_detailed
        return SubrabbitSerializer

    # Retrieve detailed information about a Subrabbit instance.
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        if request.user.is_authenticated:
            user = request.user
            instance = self.get_object()
            # Check if the authenticated user is a subscriber of the Subrabbit
            is_subscriber = instance.subscribers.filter(id=user.id).exists()
            data['isSubscriber'] = is_subscriber
        return Response(data)

class SubscribeView(generics.UpdateAPIView):
    """
    View for subscribing to a Subrabbit.

    This view allows authenticated users to subscribe to a Subrabbit by adding
    themselves to its subscribers list.

    Requires authentication.
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomAuthentication]
    queryset = Subrabbit.objects.all()
    lookup_field = 'name'

    # Handle PUT request to subscribe to a Subrabbit.
    def update(self, request, *args, **kwargs):
        subrabbit = self.get_object()
        subrabbit.subscribers.add(request.user)
        return Response({'message': 'subscribed successfully'}, status=status.HTTP_204_NO_CONTENT)

class UnsubscribeView(generics.UpdateAPIView):
    """
    View for unsubscribing from a Subrabbit.

    This view allows authenticated users to unsubscribe from a Subrabbit
    by removing themselves from its subscribers list.

    Requires authentication.
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomAuthentication]
    queryset = Subrabbit.objects.all()
    lookup_field = 'name'

    # Handle PUT request to unsubscribe from a Subrabbit.
    def update(self, request, *args, **kwargs):
        subrabbit = self.get_object()
        subrabbit.subscribers.remove(request.user)
        return Response({'message': 'unsubscribed successfully'} ,status=status.HTTP_204_NO_CONTENT)

class SearchView(generics.ListAPIView):
    """
    View for searching subrabbits.

    This view allows users to search for subrabbits by name. 
    It returns a list of subrabbits whose names start with the specified query string.
    """

    serializer_class = SubrabbitSerializer
    def get_queryset(self):
        q = self.request.query_params.get('q', None)
        if q is not None:
            return Subrabbit.objects.filter(name__startswith=q)[:5]
        return Subrabbit.objects.none()
