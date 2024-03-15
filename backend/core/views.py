import cloudinary
import requests
from accounts.authenticate import CustomAuthentication
from bs4 import BeautifulSoup
from cloudinary.uploader import upload
from django.core.files.storage import FileSystemStorage
from django.db.models import Count, F, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.permissions import SAFE_METHODS
from rest_framework.response import Response
from rest_framework.serializers import ValidationError
from rest_framework.views import APIView

from .models import Comment, CommentVote, Post, Subrabbit, Vote, VoteType
from .permissions import IsAuthenticatedOrReadOnly
from .serializers import (PostSerializer, SubrabbitSerializer,
                          SubrabbitSerializer_detailed)


class SubrabbitListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [CustomAuthentication]
    queryset = Subrabbit.objects.all().order_by('-created_at')

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

class SubrabbitDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [CustomAuthentication]
    queryset = Subrabbit.objects.all()
    lookup_field = 'name'

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SubrabbitSerializer_detailed
        return SubrabbitSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        if request.user.is_authenticated:
            user = request.user
            instance = self.get_object()
            is_subscriber = instance.subscribers.filter(id=user.id).exists()
            data['isSubscriber'] = is_subscriber
        return Response(data)

class SubscribeView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [CustomAuthentication]
    queryset = Subrabbit.objects.all()
    lookup_field = 'name'

    def update(self, request, *args, **kwargs):
        subrabbit = self.get_object()
        subrabbit.subscribers.add(request.user)
        return Response({'message': 'subscribed successfully'}, status=status.HTTP_204_NO_CONTENT)

class UnsubscribeView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [CustomAuthentication]
    queryset = Subrabbit.objects.all()
    lookup_field = 'name'

    def update(self, request, *args, **kwargs):
        subrabbit = self.get_object()
        subrabbit.subscribers.remove(request.user)
        return Response({'message': 'unsubscribed successfully'} ,status=status.HTTP_204_NO_CONTENT)

class CreatePostView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [CustomAuthentication]
    def post(self, request):
        content = request.data.get('content')
        subrabbit_id = request.data.get('subrabbitId')
        user = request.user
        title = request.data.get('title')
        subrabbit = Subrabbit.objects.get(id=subrabbit_id)
        post = Post.objects.create(
            title=title,
            content=content,
            subrabbit=subrabbit,
            author=user
        )
        return Response({'message': 'successfully created'}, status=status.HTTP_204_NO_CONTENT)

class VoteView(APIView):
    authentication_classes = [CustomAuthentication]
    def patch(self, request, format=None):
        user = request.user
        post_id = request.data.get('postId')
        vote_type = request.data.get('voteType')

        if not post_id or not vote_type:
            return Response({'detail': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        post = get_object_or_404(Post, id=post_id)

        if vote_type not in [VoteType.UP, VoteType.DOWN]:
            return Response({'detail': 'Invalid vote type'}, status=status.HTTP_400_BAD_REQUEST)

        vote, created = Vote.objects.get_or_create(user=user, post=post, defaults={'type': vote_type})

        if not created:
            if vote.type == vote_type:
                vote.delete()
            else:
                vote.type = vote_type
                vote.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

class PostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = Post.objects.annotate(
            upvotes=Count('votes', filter=Q(votes__type=VoteType.UP)),
            downvotes=Count('votes', filter=Q(votes__type=VoteType.DOWN))
        ).annotate(net_votes=F('upvotes') - F('downvotes'))

        queryset = queryset.annotate(num_comments=Count('comments'))
        if user.is_authenticated:
            queryset = queryset.filter(subrabbit__subscribers=user)
        
        queryset = queryset.order_by('-net_votes', '-num_comments', '-created_at')
        
        return queryset

class SubrabbitPostsList(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        subrabbit_name = self.kwargs['subrabbit_name']
        
        queryset = Post.objects.filter(subrabbit__name=subrabbit_name)
        
        # Annotate post objects based on their votes
        queryset = queryset.annotate(
            upvotes=Count('votes', filter=Q(votes__type=VoteType.UP)),
            downvotes=Count('votes', filter=Q(votes__type=VoteType.DOWN))
        ).annotate(net_votes=F('upvotes') - F('downvotes'))
        
        # Annotate post objects based on number of comments
        queryset = queryset.annotate(num_comments=Count('comments'))
        
        # Order by net_votes descending and number of comments descending
        queryset = queryset.order_by('-net_votes', '-num_comments', '-created_at')
        
        return queryset


@api_view(['GET'])
def fetch_url_metadata(request):
    url = request.GET.get('url')

    if not url:
        return Response('Invalid URL', status=400)

    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    title = soup.title.string if soup.title else ''
    description_tag = soup.find('meta', attrs={'name': 'description'})
    description = description_tag['content'] if description_tag else ''
    image_tag = soup.find('meta', attrs={'property': 'og:image'})
    image_url = image_tag['content'] if image_tag else ''

    return Response({
        'success': 1,
        'meta': {
            'title': title,
            'description': description,
            'image': {
                'url': image_url,
            },
        },
    })

@api_view(['POST'])
def upload_image(request):
    uploaded_file = request.FILES['image']
    result = upload(uploaded_file)
    file_url = result['secure_url']

    return Response({
        'success': 1,
        'file': {
            'url': file_url,
        },
    })

@api_view(['POST'])
def upload_file(request):
    uploaded_file = request.FILES['file']
    fs = FileSystemStorage()
    filename = fs.save(uploaded_file.name, uploaded_file)
    file_url = fs.url(filename)
    file_size = fs.size(filename)
    return Response({
        'success': 1,
        'file': {
            'url': file_url,
            'name': uploaded_file.name,
            'size': file_size,
        },
    })
