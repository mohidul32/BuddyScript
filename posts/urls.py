from django.urls import path
from .views import (
    PostListCreateView,
    PostDetailView,
    PostLikeToggleView,
    CommentListCreateView,
    CommentDetailView,
    CommentLikeToggleView,
    PostLikesListView,
    CommentLikesListView
)

urlpatterns = [
    path('', PostListCreateView.as_view(), name='post-list-create'),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:pk>/like/', PostLikeToggleView.as_view(), name='post-like'),
    path('<int:post_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('comments/<int:pk>/like/', CommentLikeToggleView.as_view(), name='comment-like'),
    path('posts/<int:post_id>/likes/', PostLikesListView.as_view(), name='post-likes-list'),
    path('comments/<int:comment_id>/likes/', CommentLikesListView.as_view(), name='comment-likes-list'),
]
