from django.urls import path
from .views import editorjs_views, post_views, subrabbit_views


urlpatterns = [
    path('subrabbits/', subrabbit_views.SubrabbitListCreateView.as_view(), name='subrabbits'),
    path('subrabbit/<str:name>/', subrabbit_views.SubrabbitDetail.as_view(), name='subrabbit-detail'),
    path('subrabbit/<str:name>/subscribe/', subrabbit_views.SubscribeView.as_view(), name='subscribe'),
    path('subrabbit/<str:name>/unsubscribe/', subrabbit_views.UnsubscribeView.as_view(), name='unsubcribe'),
    path('search/', subrabbit_views.SearchView.as_view(), name='search'),

    path('create-post/', post_views.CreatePostView.as_view(), name='create-post'),
    path('subrabbit/post/vote/', post_views.VoteView.as_view(), name='post-vote'),
    path('posts/', post_views.PostListView.as_view(), name='posts'),
    path('posts/<int:post_id>/comments/', post_views.CommentListView.as_view(), name='post-comments'),
    path('post-detail/<str:pk>/', post_views.PostDetailView.as_view(), name='post-detail'),
    path('subrabbit/post/comment/', post_views.CreateComment.as_view(), name='create-comment'),
    path('subrabbit/post/comment/vote/', post_views.CommentVoteView.as_view(), name='comment-vote'),

    path('link/', editorjs_views.fetch_url_metadata, name='link'),
    path('upload-image/', editorjs_views.upload_image, name='image-upload'),
    path('upload-file/', editorjs_views.upload_file, name='file-upload'),


]
