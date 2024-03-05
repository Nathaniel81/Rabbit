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
