from accounts.authenticate import CustomAuthentication
from django.core.cache import cache
from django.db.models import Count, F, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Comment, CommentVote, Post, Subrabbit, Vote, VoteType
from core.permissions import IsAuthenticatedOrReadOnly
from core.serializers import CommentSerializer, PostSerializer


class CreatePostView(APIView):
    """        
    View for creating a new post.
    
    This view allows authenticated users to create a new post in a specific Subrabbit.

    Requires authentication.
    """

    permission_classes = [IsAuthenticated]
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
    """
    View for voting on a post.

    This view allows authenticated users to vote on a post (either upvote or downvote).

    Requires authentication.
    """

    permission_classes = [IsAuthenticated]
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

class PostPagination(PageNumberPagination):
    page_size = 3

class PostListView(generics.ListAPIView):
    """
    View for listing posts.

    This view allows users to retrieve a list of posts, optionally filtered by Subrabbit name.
    Posts are ordered by the number of votes, number of comments, and if the user is authenticated,
    the view retrieves posts that are in the communities the user has joined.
    """

    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = PostPagination

    def get_queryset(self):
        user = self.request.user
        subrabbit_name = self.request.query_params.get('subrabbitName')
        page = self.request.query_params.get('page')

        if page == '1':
            # Retrieve cached posts for the first page if available
            cached_posts = cache.get(f'posts:{subrabbit_name}:page1')
            if cached_posts is not None:
                return cached_posts
        posts = self.fetch_posts(subrabbit_name, user)

        if page == '1':
            # Cache the fetched posts for the first page
            cache.set(f'posts:{subrabbit_name}:page1', posts)
        
        return posts

    def fetch_posts(self, subrabbit_name, user):
        """
        Fetch posts from the database.

        Parameters:
            subrabbit_name: Name of the Subrabbit to filter posts.
            user: User object representing the authenticated user.

        Returns:
            posts: List of posts fetched from the database.
        """

        posts = Post.objects.all()
        if subrabbit_name:
            posts = posts.filter(subrabbit__name=subrabbit_name)
        if user.is_authenticated:
            posts = posts.filter(subrabbit__subscribers=user)

        # Annotate post objects based on their votes, number of comments, and net votes
        posts = posts.annotate(
            upvotes=Count('votes', filter=Q(votes__type=VoteType.UP)),
            downvotes=Count('votes', filter=Q(votes__type=VoteType.DOWN)),
            net_votes=F('upvotes') - F('downvotes'),
            num_comments=Count('comments')
        )
        
        # Order by net_votes descending, created_at descending, and num_comments descending
        posts = posts.order_by('-net_votes', '-created_at', '-num_comments')

        return list(posts)
        posts = posts.order_by('-created_at')
        return posts

    # Handle GET request to list posts.
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return response

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating, and deleting a post.

    This view allows users to retrieve, update, or delete a specific post by its primary key.
    """

    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_url_kwarg = 'pk'

    # Handle DELETE request to delete a post.
    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        if response.status_code == status.HTTP_204_NO_CONTENT:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return response

class CreateComment(generics.CreateAPIView):
    """
    View for creating a new comment.

    This view allows authenticated users to create a new comment on a post.
    Users can reply to an existing comment by specifying the ID of the parent comment.

    Requires authentication.
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomAuthentication]
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    # Perform the creation of a new comment.
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    # Handle POST request to create a new comment.
    def create(self, request, *args, **kwargs):
        data = request.data.copy()  # Make a mutable copy
        post = Post.objects.get(id=data['postId'])
        parent_comment = None
        if 'replyToId' in data:
            parent_comment = Comment.objects.get(id=data['replyToId'])
        data['parent_post'] = post.id
        if parent_comment:
            data['parent_comment_id'] = parent_comment.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class CommentVoteView(APIView):
    """
    View for voting on a comment.

    This view allows authenticated users to vote on a comment by specifying the comment ID
    and the type of vote (upvote or downvote).

    Requires authentication.
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomAuthentication]

    # Handle PATCH request to vote on a comment.
    def patch(self, request, format=None):
        user = request.user
        comment_id = request.data.get('commentId')
        vote_type = request.data.get('voteType')
        if not comment_id or not vote_type:
            return Response({'detail': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        comment = get_object_or_404(Comment, id=comment_id)
        if vote_type not in [VoteType.UP, VoteType.DOWN]:
            return Response({'detail': 'Invalid vote type'}, status=status.HTTP_400_BAD_REQUEST)
        vote, created = CommentVote.objects.get_or_create(user=user, comment=comment, defaults={'type': vote_type})
        if not created:
            if vote.type == vote_type:
                vote.delete()
            else:
                vote.type = vote_type
                vote.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
