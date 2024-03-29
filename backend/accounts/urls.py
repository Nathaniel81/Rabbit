from django.urls import path
from . import views
    
urlpatterns = [
    path('auth/github/', views.GithubOauthSignInView.as_view(), name='github'),
    path('refresh/', views.RefreshTokenView.as_view(), name='token_refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('username/', views.UpdateUsernameView.as_view()),
    path('profile-picture/', views.UpdateProfilePictureView.as_view()),
]
