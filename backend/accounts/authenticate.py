"""
Custom authentication module for handling authentication with JWT and CSRF validation.

This module provides a custom authentication class `CustomAuthentication`, which extends
`rest_framework_simplejwt.authentication.JWTAuthentication` to authenticate users based on
the httponly cookie access_token and enforce CSRF validation.

Example usage:
    from custom_auth import CustomAuthentication

    class MyView(APIView):
        authentication_classes = [CustomAuthentication]
        ...
"""

from rest_framework_simplejwt import authentication as jwt_authentication
from django.conf import settings
from rest_framework import authentication, exceptions as rest_exceptions
from django.middleware.csrf import CsrfViewMiddleware


def enforce_csrf(request):
    """
    Enforce CSRF validation.

    Parameters:
    - request (HttpRequest): The HTTP request object.

    Raises:
    - PermissionDenied: If CSRF validation fails.
    """

    csrf_middleware = CsrfViewMiddleware(request)
    csrf_token = request.META.get('HTTP_X_CSRFTOKEN', '')
    request.META['CSRF_COOKIE'] = csrf_token
    reason = csrf_middleware.process_view(request, None, (), {})

    if reason:
        raise rest_exceptions.PermissionDenied('CSRF Failed: %s' % reason)

class CustomAuthentication(jwt_authentication.JWTAuthentication):
    """
    Custom authentication class to authenticate users based on the httponly cookie access_token.

    This class extends `rest_framework_simplejwt.authentication.JWTAuthentication` and adds
    CSRF validation enforcement.

    Attributes:
    - authentication_classes: A list of authentication classes.
    - enforce_csrf: A function to enforce CSRF validation.
    """

    def authenticate(self, request):
        """
        Authenticate the user based on the httponly cookie access_token.

        Parameters:
        - request (HttpRequest): The HTTP request object.

        Returns:
        - tuple or None: A tuple of (user, validated_token) if authentication is successful,
          or None if authentication fails.
        """

        raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE']) or None

        if raw_token is None:
            return None
        
        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception as e:
            return None

        enforce_csrf(request)

        return self.get_user(validated_token), validated_token
