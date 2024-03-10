from django.urls import path
from . import views
    
urlpatterns = [
    path('', views.GetAllUsers.as_view(), name='users'),
    path('auth/github/', views.GithubOauthSignInView.as_view(), name='github'),
    path('refresh/', views.RefreshTokenView.as_view(), name='token_refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]
