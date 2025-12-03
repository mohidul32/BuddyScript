from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Prefetch
from .models import Post, PostLike, Comment, CommentLike
from .serializers import (
    PostSerializer,
    PostCreateSerializer,
    CommentSerializer
)


class PostListCreateView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateSerializer
        return PostSerializer

    def get_queryset(self):
        user = self.request.user
        # Get public posts or user's own private posts
        queryset = Post.objects.filter(
            Q(visibility='public') | Q(author=user, visibility='private')
        ).select_related('author').prefetch_related(
            'likes__user',
            Prefetch('comments', queryset=Comment.objects.filter(parent=None))
        )
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return Post.objects.filter(
            Q(visibility='public') | Q(author=user, visibility='private')
        ).select_related('author').prefetch_related('likes__user', 'comments')

    def perform_update(self, serializer):
        # Only allow author to update
        if serializer.instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own posts.")
        serializer.save()

    def perform_destroy(self, instance):
        # Only allow author to delete
        if instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own posts.")
        instance.delete()


class PostLikeToggleView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response(
                {'error': 'Post not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if post is accessible
        if post.visibility == 'private' and post.author != request.user:
            return Response(
                {'error': 'Post not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        like, created = PostLike.objects.get_or_create(
            user=request.user,
            post=post
        )

        if not created:
            like.delete()
            return Response({
                'liked': False,
                'likes_count': post.likes_count
            })

        return Response({
            'liked': True,
            'likes_count': post.likes_count
        })


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        return Comment.objects.filter(
            post_id=post_id,
            parent=None
        ).select_related('author').prefetch_related('likes__user', 'replies')

    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            raise serializers.ValidationError("Post not found")

        # Check if post is accessible
        if post.visibility == 'private' and post.author != self.request.user:
            raise permissions.PermissionDenied("You cannot comment on this post.")

        serializer.save(author=self.request.user, post=post)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Comment.objects.all()

    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own comments.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own comments.")
        instance.delete()


class CommentLikeToggleView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response(
                {'error': 'Comment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        like, created = CommentLike.objects.get_or_create(
            user=request.user,
            comment=comment
        )

        if not created:
            like.delete()
            return Response({
                'liked': False,
                'likes_count': comment.likes_count
            })

        return Response({
            'liked': True,
            'likes_count': comment.likes_count
        })