from . import views
from django.urls import path


urlpatterns = [
    path('subrabbits/', views.SubrabbitListCreateView.as_view(), name='subrabbits'),
    path('subrabbit/<str:name>/', views.SubrabbitDetail.as_view(), name='subrabbit-detail'),

    path('subrabbit/<str:name>/subscribe/', views.SubscribeView.as_view(), name='subscribe'),
    path('subrabbit/<str:name>/unsubscribe/', views.UnsubscribeView.as_view(), name='unsubcribe'),

    path('link/', views.fetch_url_metadata),
    path('upload-image/', views.upload_image),
    path('upload-file/', views.upload_file),

    path('create-post/', views.CreatePostView.as_view(), name='create-post'),
    path('subrabbit/post/vote/', views.VoteView.as_view(), name='post-vote'),
    path('posts/', views.PostListView.as_view(), name='posts'),
    path('post-detail/<str:pk>/', views.PostDetailView.as_view(), name='post-detail'),
    path('subrabbit/<str:subrabbit_name>/posts/', views.SubrabbitPostsList.as_view(), name='subrabbit-posts'),
    path('subrabbit/post/comment/', views.CreateComment.as_view(), name='create-comment'),
    path('subrabbit/post/comment/vote/', views.CommentVoteView.as_view(), name='create-vote'),
    path('search/', views.SearchView.as_view()),
]
