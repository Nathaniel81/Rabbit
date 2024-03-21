from rest_framework import serializers
from .models import Subrabbit, Vote, Post, VoteType, Comment
from accounts.serializers import UserSerializer
from accounts.models import User
from django.db.models import Count, Q, F


class VoteSerializer(serializers.ModelSerializer):
    """
    Serializer for handling vote objects.

    This serializer serializes Vote objects, converting them into JSON format.
    """

    class Meta:
        model = Vote
        fields = '__all__'

class SubrabbitSerializer(serializers.ModelSerializer):
    """
    Serializer for Subrabbit objects.

    This serializer serializes Subrabbit objects, converting them into JSON format.
    """

    creator = UserSerializer(read_only=True)
    subscribers = UserSerializer(many=True, read_only=True)
    moderators = UserSerializer(many=True, read_only=True)
    class Meta:
        model = Subrabbit
        exclude = ('rules', 'description', )

class ParentCommentSerializer(serializers.ModelSerializer):
    """
    Serializer for parent comment objects.

    This serializer serializes parent comment objects, converting them into JSON format.
    """

    comment_votes = VoteSerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for comment objects.

    This serializer serializes comment objects, converting them into JSON format.
    """

    comment_votes = VoteSerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)

    # Serializer for parent comment (if exists)
    parent_comment = ParentCommentSerializer(read_only=True)

     # Field to store the ID of the parent comment (write only)
    parent_comment_id = serializers.PrimaryKeyRelatedField(
        source='parent_comment', queryset=Comment.objects.all(), 
        allow_null=True, required=False, write_only=True)

    class Meta:
        model = Comment
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for post objects.

    This serializer serializes post objects, converting them into JSON format.
    """

    content = serializers.JSONField(read_only=True)
    author = UserSerializer(read_only=True)
    comments = serializers.SerializerMethodField()
    votes = VoteSerializer(many=True, read_only=True)
    subrabbit = SubrabbitSerializer(read_only=True)
    class Meta:
        model = Post
        fields = '__all__'

    def get_comments(self, obj):
        """
        Method to retrieve and serialize comments related to the post.

        This method retrieves comments associated with the given post object,
        annotates them with upvotes, downvotes, and net votes, and then serializes
        them using the CommentSerializer, ordered by net votes and creation date.
        """

        comments = Comment.objects.filter(parent_post=obj).annotate(
            upvotes=Count('comment_votes', filter=Q(comment_votes__type=VoteType.UP)),
            downvotes=Count('comment_votes', filter=Q(comment_votes__type=VoteType.DOWN))
        ).annotate(net_votes=F('upvotes') - F('downvotes'))
        return CommentSerializer(comments.order_by('-net_votes', '-created_at'), 
                                                    many=True, read_only=True).data

class SubrabbitSerializer_detailed(serializers.ModelSerializer):
    """
    Detailed serializer for subrabbit objects.

    This serializer provides detailed information about subrabbit objects, including creator,
    subscribers, moderators, and the count of members.
    """

    creator = UserSerializer(read_only=True)
    subscribers = UserSerializer(many=True, read_only=True)
    moderators = UserSerializer(many=True, read_only=True)
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Subrabbit
        fields = '__all__'

    def get_members_count(self, obj):
        """Get the count of members in the subrabbit."""

        return obj.subscribers.count()
