"""
Module for interacting with GitHub OAuth API.

This module provides a class `Github` for exchanging OAuth code for an access token,
fetching user information, and fetching user emails from GitHub.

Example usage:
    >>> github = Github()
    >>> token = github.exchange_code_for_token("oauth_code")
    >>> user_data = github.get_github_user(token)
    >>> emails_data = github.get_github_emails(token)
"""

import requests
from django.conf import settings
from rest_framework import serializers, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User


class Github():
    """
    Class for interacting with GitHub OAuth API.

    This class provides methods for exchanging OAuth code for an access token,
    fetching user information, and fetching user emails.
    """

    @staticmethod
    def exchange_code_for_token(code):
        """
        Exchange OAuth code for an access token.

        Parameters:
        - code (str): The OAuth code obtained during authentication.

        Returns:
        - token (str): The access token.
        """

        params_payload = {
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
        """
        Fetch GitHub user information using the provided access token.

        Parameters:
        - access_token (str): The access token obtained after authentication.

        Returns:
        - user_data (dict): Dictionary containing user information.
        """

        try:
            headers = {
                'Authorization': f'Bearer {access_token}'
            }
            resp = requests.get('https://api.github.com/user', headers=headers)
            user_data = resp.json()
            return user_data
        except:
            raise AuthenticationFailed("Invalid access_token", 401)

    @staticmethod
    def get_github_emails(access_token):
        """
        Fetch GitHub user emails using the provided access token.

        Parameters:
        - access_token (str): The access token obtained after authentication.

        Returns:
        - emails_data (list): List containing user email information.
        """

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
