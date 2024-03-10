import jwt
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from jwt.exceptions import ExpiredSignatureError
from rest_framework import status
from rest_framework.authentication import BaseAuthentication, CSRFCheck
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

from .models import User


def enforce_csrf(request):
    """
    Enforce CSRF validation.
    """
    check = CSRFCheck(get_response=request)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied('CSRF Failed: %s' % reason)


class CustomAuthentication(BaseAuthentication):
    """
    Custom authentication class to authenticate users based on the httponly cookie access_token.
    """


    def authenticate(self, request):
        access_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        if not access_token:
            return None
        try:
            user_id = jwt.decode(
            access_token, 
            settings.SIMPLE_JWT['SIGNING_KEY'], 
            algorithms=[settings.SIMPLE_JWT['ALGORITHM']]
            ).get('user_id')

            user = get_object_or_404(User, id=user_id)

            if user:
                enforce_csrf(request)

            return user, None

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')

        except AuthenticationFailed:
            return None
            
        # try:
        #     user_id = AccessToken(access_token).get('user_id')

        #     # user = User.objects.get(id=user_id)
        #     user = get_object_or_404(User, id=user_id)
        #     if user:
        #         enforce_csrf(request)

        #     return user, None

        # except AuthenticationFailed:
        #     return None

        # except TokenError as e:
        #     raise PermissionDenied(detail=str(e))
