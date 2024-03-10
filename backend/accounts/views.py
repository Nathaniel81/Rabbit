import requests
from django.conf import settings
from rest_framework import serializers, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

# from .permissions import IsAuthenticated

from .models import User
from .serializers import GithubLoginSerializer, UserSerializer

class GetAllUsers(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get(self, request):
        token = request.COOKIES.get('access_token')
        print(token)
        serializer = self.serializer_class(data=request.data)
        return Response({})

class GithubOauthSignInView(APIView):
    serializer_class = GithubLoginSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            code_data = data.get('code')
            access_token = code_data.get('access_token')
            refresh_token = code_data.get('refresh_token')

            if access_token and refresh_token:
                response = Response({
                    'user_id': code_data.get('user_id'),
                    'username': code_data.get('username'),
                    'email': code_data.get('email'),
                }, status=status.HTTP_200_OK)

                response.set_cookie(
                    key='access_token',
                    value=access_token,
                    httponly=True,
                    secure=settings.JWT_AUTH_SECURE,
                    samesite=settings.JWT_AUTH_SAMESITE,
                )

                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=settings.JWT_AUTH_SECURE,
                    samesite=settings.JWT_AUTH_SAMESITE,
                )
                return response
            else:
                return Response("No access token found in the response", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)