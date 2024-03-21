import os
import requests
from django.conf import settings
from dotenv import load_dotenv
from rest_framework import serializers, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from cloudinary.utils import cloudinary_url

from .github import Github
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.

    This serializer is used to serialize user data, including the user's ID, username, email,
    and profile picture URL (if available).

    Attributes:
        profile_picture: Serializer method field to retrieve the URL of the user's profile picture.

    """

    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile_picture',)

    # Get the URL of the user's profile picture.
    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return cloudinary_url(obj.profile_picture.public_id)[0]

        return None

# Generate JWT tokens for the provided user
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class GithubLoginSerializer(serializers.Serializer):
    """
    Serializer for handling GitHub login.

    This serializer validates the provided GitHub code and exchanges it for an access token.
    """

    code = serializers.CharField()

    def validate_code(self, code):   
        """
        Validate the provided GitHub code and exchange it for an access token.

        Parameters:
            code (str): The GitHub code obtained during the OAuth process.

        Returns:
            dict: A dictionary containing user data along with access and refresh tokens.
        """

        access_token = Github.exchange_code_for_token(code)
        
        if access_token:
            user_data = Github.get_github_user(access_token)
            github_username = user_data['login']
            github_id = user_data['id']
            emails_data = Github.get_github_emails(access_token)

             # Find the primary email address associated with the user
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
