from django.urls import path
from . import views
    
urlpatterns = [
    path('', views.GetAllUsers.as_view(), name='users'),
]