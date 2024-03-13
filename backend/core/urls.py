from . import views
from django.urls import path


urlpatterns = [
    path('subrabbits/', views.SubrabbitListCreateView.as_view(), name='subrabbits'),
    path('subrabbit/<str:name>/', views.SubrabbitDetail.as_view(), name='subrabbit-detail'),
    path('subrabbit/<str:name>/subscribe/', views.SubscribeView.as_view(), name='subscribe'),
    path('subrabbit/<str:name>/unsubscribe/', views.UnsubscribeView.as_view(), name='unsubcribe'),
]
