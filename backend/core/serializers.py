from rest_framework import serializers
from .models import Subrabbit
from accounts.serializers import UserSerializer
from accounts.models import User


class SubrabbitSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    subscribers = UserSerializer(many=True, read_only=True)
    moderators = UserSerializer(many=True, read_only=True)
    class Meta:
        model = Subrabbit
        exclude = ('rules', 'description', )

class SubrabbitSerializer_detailed(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    subscribers = UserSerializer(many=True, read_only=True)
    moderators = UserSerializer(many=True, read_only=True)
    members_count = serializers.SerializerMethodField()
    is_subscriber = serializers.SerializerMethodField()
    # posts = PostSerializer(many=True, read_only=True)

    class Meta:
        model = Subrabbit
        fields = '__all__'

    def get_members_count(self, obj):
        return obj.subscribers.count()

    def get_is_subscriber(self, obj):
        user = self.context['request'].user
        return obj.subscribers.filter(id=user.id).exists()