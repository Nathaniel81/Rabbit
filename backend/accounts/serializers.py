import os
import requests
from django.conf import settings
from dotenv import load_dotenv
from rest_framework import serializers, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .github import Github
from .models import User


class UserSerializer(serializers.ModelSerializer):
    load_dotenv()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile_picture',)

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return f"https://res.cloudinary.com/{os.getenv('CLOUDINARY_NAME')}/{obj.profile_picture}"
        return None


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class GithubLoginSerializer(serializers.Serializer):
    code = serializers.CharField()
    
    def validate_code(self, code):   
        access_token = Github.exchange_code_for_token(code)
        
        if access_token:
            user_data = Github.get_github_user(access_token)
            github_username = user_data['login']
            github_id = user_data['id']
            emails_data = Github.get_github_emails(access_token)
            primary_email = next((email for email in emails_data if email.get('primary')), None)

            if primary_email:
                email = primary_email.get('email')

            try:
                user = User.objects.get(github_id=github_id)
                user.email = email
                user.save()
            except User.DoesNotExist:
                user = User.objects.create_user(username=user_data['login'], email=email, github_id=github_id)

            serialized_user = UserSerializer(user).data

            token = get_tokens_for_user(user)

            access_token = token["access"]
            refresh_token = token["refresh"]

            serialized_user['access_token'] = access_token
            serialized_user['refresh_token'] = refresh_token

            return serialized_user
        else:
            raise serializers.ValidationError("Unable to fetch access token from GitHub.")
