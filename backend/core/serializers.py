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

class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for comment objects.

    This serializer serializes comment objects, converting them into JSON format.
    """

    comment_votes = VoteSerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)

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
    comments_count = serializers.SerializerMethodField()
    votes = VoteSerializer(many=True, read_only=True)
    # subrabbit = SubrabbitSerializer(read_only=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'content', 
            'author', 
            'comments_count', 
            'votes', 
            'subrabbit', 
            'created_at'
        ]

    def get_comments_count(self, obj):
        """
        Method to get the number of comments.
        """

        return Comment.objects.filter(parent_post=obj).count()

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
