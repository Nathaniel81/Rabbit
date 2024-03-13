from rest_framework_simplejwt import authentication as jwt_authentication
from django.conf import settings
from rest_framework import authentication, exceptions as rest_exceptions
from django.middleware.csrf import CsrfViewMiddleware


def enforce_csrf(request):
    """
    Enforce CSRF validation.
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
    """

    def authenticate(self, request):
        raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE']) or None

        if raw_token is None:
            return None
        
        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception as e:
            return None
        enforce_csrf(request)

        return self.get_user(validated_token), validated_token
