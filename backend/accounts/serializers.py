from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Friendship
from django.db import models

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()
    cover_photo_url = serializers.SerializerMethodField()
    posts_count = serializers.IntegerField(read_only=True)
    friends_count = serializers.IntegerField(read_only=True)
    friendship_status = serializers.SerializerMethodField()  # NEW

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'bio', 'profile_picture', 'profile_picture_url',
            'cover_photo', 'cover_photo_url', 'location', 'website',
            'is_online', 'last_seen', 'date_joined',
            'posts_count', 'friends_count', 'friendship_status'
        )
        read_only_fields = ('id', 'date_joined', 'is_online', 'last_seen')

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
        return None

    def get_cover_photo_url(self, obj):
        if obj.cover_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_photo.url)
        return None

    def get_friendship_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None

        if obj.id == request.user.id:
            return 'self'

        # Check if friendship exists
        friendship = Friendship.objects.filter(
            models.Q(from_user=request.user, to_user=obj) |
            models.Q(from_user=obj, to_user=request.user)
        ).first()

        if not friendship:
            return 'none'

        if friendship.status == 'accepted':
            return 'friends'
        elif friendship.from_user == request.user:
            return 'pending_sent'
        else:
            return 'pending_received'


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'bio',
            'profile_picture', 'cover_photo',
            'location', 'website'
        )


class FriendshipSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = ('id', 'from_user', 'to_user', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')