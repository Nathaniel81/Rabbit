import requests
from accounts.authenticate import CustomAuthentication
from django.conf import settings
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.middleware import csrf
from rest_framework import exceptions, generics, serializers, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt import tokens

from .models import User
from .serializers import GithubLoginSerializer, UserSerializer
from django.core.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated


class GithubOauthSignInView(APIView):
    """
    View for handling GitHub OAuth sign-in.

    This view handles the POST requests for GitHub OAuth sign-in. It validates the GitHub code
    provided in the request, exchanges it for access and refresh tokens, sets these tokens as cookies
    in the response, and returns user data along with HTTP status code 200 upon successful authentication.
    """

    serializer_class = GithubLoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            code_data = data.get('code')
            access_token = code_data.get('access_token')
            refresh_token = code_data.get('refresh_token')

            if access_token and refresh_token:
                # Construct response with user data and set cookies for tokens
                response = Response({
                    'user_id': code_data.get('id'),
                    'username': code_data.get('username'),
                    'email': code_data.get('email'),
                    'profile_picture': code_data.get('profile_picture'),
                }, status=status.HTTP_200_OK)

                response.set_cookie(
                    key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                    value=access_token,
                    expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                    secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )

                response.set_cookie(
                    key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                    value=refresh_token,
                    expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                    secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )

                # Generate and set CSRF token
                csrf.get_token(request)
                
                return response
            else:
                return Response("No access token found in the response", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RefreshTokenView(APIView):
    """
    View for refreshing JWT tokens.

    This view handles the POST requests for refreshing JWT tokens.
    It retrieves the refresh token from the request cookies,
    generates new access and refresh tokens, sets these tokens as cookies in the response, 
    and returns the response with HTTP status code 200 upon successful token refresh.
    """

    # Handle POST requests for refreshing access tokens
    def post(self, request):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        if not refresh_token:
            return Response({'error': 'Refresh token is missing'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)
            new_refresh_token = str(token)
            response = Response()
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=new_access_token,
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                value=new_refresh_token,
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
            csrf.get_token(request)
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """
    View for logging out users.

    This view handles the POST requests for logging out users. 
    It retrieves the refresh token from the request cookies,
    blacklists the token to invalidate it, and removes cookies related to authentication and CSRF token. 
    """

    # Handle POST requests for logging out users
    def post(self, request):
        try:
            refreshToken = request.COOKIES.get(
                settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
            token = tokens.RefreshToken(refreshToken)
            token.blacklist()

            response = Response({'LoggedOut'})
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
            response.delete_cookie("X-CSRFToken")
            response.delete_cookie("csrftoken")
            response["X-CSRFToken"]=None
        
            return response
        except tokens.TokenError as e:
            response = Response({'LoggedOut'})
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
            response.delete_cookie("X-CSRFToken")
            response.delete_cookie("csrftoken")
            response["X-CSRFToken"]=None
        
            return response
        except Exception as e:
            raise exceptions.ParseError("Invalid token")

class UpdateUsernameView(generics.UpdateAPIView):
    """
    View for updating the username of the authenticated user.

    This view handles the PATCH requests for updating the username of the authenticated user.
    It requires authentication and permission of the authenticated user.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = [CustomAuthentication]
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        username = request.data.get('username')
        if not username:
            return Response('Invalid input', status=400)
        user = request.user
        try:
            user.full_clean()
            user.username = username
            user.save()
            return Response({'username': user.username}, status=200)
        except ValidationError as e:
            return Response(str(e), status=400)

class UpdateProfilePictureView(generics.UpdateAPIView):
    """
    View for updating the profile picture of the authenticated user.

    This view handles the PATCH requests for updating the profile picture of the authenticated user.
    It requires authentication and permission of the authenticated user.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = [CustomAuthentication]
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        profile_picture = request.FILES.get('profile_picture')

        if not profile_picture:
            return Response('Invalid input', status=400)

        user = request.user
        user.profile_picture = profile_picture

        try:
            user.full_clean()
            user.save()
            serializer = self.serializer_class(user)
            profile_picture = serializer.data.get('profile_picture')
            return Response({'profile_picture': profile_picture}, status=200)
        except ValidationError as e:
            return Response(str(e), status=400)
