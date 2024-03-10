import requests
from django.conf import settings
from rest_framework import serializers, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User


class Github():
    @staticmethod
    def exchange_code_for_token(code):
        params_payload={
            "client_id": settings.GITHUB_CLIENT_ID, 
            "client_secret": settings.GITHUB_SECRET, 
            "code": code,
            "scope": "user:email"
        }
        get_access_token = requests.post(
            "https://github.com/login/oauth/access_token", 
            params=params_payload, 
            headers={'Accept': 'application/json'}
        )
        payload = get_access_token.json()
        token = payload.get('access_token')
        return token
    
    @staticmethod
    def get_github_user(access_token):
        try:
            headers = {
                'Authorization': f'Bearer {access_token}'
            }
            resp = requests.get('https://api.github.com/user', headers=headers)
            user_data = resp.json()
            return user_data
        except:
            raise AuthenticationFailed("invalid access_token", 401)

    @staticmethod
    def get_github_emails(access_token):
        try:
            headers = {
                'Authorization': f'Bearer {access_token}'
            }
            resp = requests.get('https://api.github.com/user/emails', headers=headers)
            emails_data = resp.json()
            return emails_data
        except Exception as e:
            print(f"Error fetching emails: {e}")
            return []
