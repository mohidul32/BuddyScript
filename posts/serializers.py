from rest_framework import serializers
from .models import Post, PostLike, Comment, CommentLike
from accounts.serializers import UserSerializer


class PostLikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PostLike
        fields = ('id', 'user', 'created_at')


class CommentLikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CommentLike
        fields = ('id', 'user', 'created_at')


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    replies_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    likes = CommentLikeSerializer(many=True, read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            'id', 'post', 'author', 'parent', 'content',
            'created_at', 'updated_at', 'likes_count',
            'replies_count', 'is_liked', 'likes', 'replies'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'post')

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return CommentLike.objects.filter(
                comment=obj,
                user=request.user
            ).exists()
        return False

    def get_replies(self, obj):
        if obj.parent is None:  # Only get replies for root comments
            replies = obj.replies.all()
            return CommentSerializer(replies, many=True, context=self.context).data
        return []

    # def validate_content(self, value):
    #     if not value.strip():
    #         raise serializers.ValidationError("Content cannot be empty.")
    #     if len(value) > 1000:
    #         raise serializers.ValidationError("Content too long (max 1000 characters).")
    #     return value
    #
    # def validate(self, data):
    #     parent = data.get('parent')
    #     post = data.get('post')
    #
    #     if parent and parent.post != post:
    #         raise serializers.ValidationError("Parent comment must belong to the same post.")
    #
    #     if parent and parent.parent:
    #         raise serializers.ValidationError("Nested replies beyond one level are not allowed.")

        return data


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    likes = PostLikeSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'content', 'image', 'image_url',
            'visibility', 'created_at', 'updated_at',
            'likes_count', 'comments_count', 'is_liked',
            'likes', 'comments'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(
                post=obj,
                user=request.user
            ).exists()
        return False

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None

    def get_comments(self, obj):
        # Only get root comments (no parent)
        comments = obj.comments.filter(parent=None)
        return CommentSerializer(comments, many=True, context=self.context).data


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ('content', 'image', 'visibility')

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Content cannot be empty.")
        if len(value) > 1000:
            raise serializers.ValidationError("Content too long (max 1000 characters).")
        return value

    def validate_visibility(self, value):
        allowed = ['public', 'private']
        if value not in allowed:
            raise serializers.ValidationError(f"Visibility must be one of: {', '.join(allowed)}.")
        return value

    def validate_image(self, image):
        if image.size > 2 * 1024 * 1024:  # 2 MB limit
            raise serializers.ValidationError("Image size cannot exceed 2MB.")
        return image