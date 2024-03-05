from . import views
from django.urls import path


urlpatterns = [
    path('subrabbits/', views.SubrabbitListCreateView.as_view(), name='subrabbits'),
]
