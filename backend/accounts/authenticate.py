from rest_framework_simplejwt import authentication as jwt_authentication
from django.conf import settings
from rest_framework import authentication, exceptions as rest_exceptions


def enforce_csrf(request):
    """
    Enforce CSRF validation.
    """

    check = authentication.CSRFCheck(request)
    reason = check.process_view(request, None, (), {})
    if reason:
      raise rest_exceptions.PermissionDenied('CSRF Failed: %s' % reason)

class CustomAuthentication(jwt_authentication.JWTAuthentication):
    """
    Custom authentication class to authenticate users based on the httponly cookie access_token.
    """

    def authenticate(self, request):
        header = self.get_header(request)
        raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE']) or None 
        validated_token = self.get_validated_token(raw_token)
        enforce_csrf(request)

        return self.get_user(validated_token), validated_token
