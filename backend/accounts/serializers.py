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
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = '__all__'

    def get_profile_picture(self, obj):
        return f"https://res.cloudinary.com/{os.getenv('CLOUDINARY_NAME')}/{obj.profile_picture}"

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
            emails_data = Github.get_github_emails(access_token)
            primary_email = next((email for email in emails_data if email.get('primary')), None)

            if primary_email:
                email = primary_email.get('email')

            try:
                user = User.objects.get(username=github_username)
                user.email = email
                user.save()
            except User.DoesNotExist:
                user = User.objects.create_user(username=github_username, email=email)

            token = get_tokens_for_user(user)

            access_token = token["access"]
            refresh_token = token["refresh"]

            return {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user_id': user.id,
                'username': github_username,
                'email': email,
            }
        else:
            raise serializers.ValidationError("Unable to fetch access token from GitHub.")
