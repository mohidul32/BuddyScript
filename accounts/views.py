from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q, Count
from .models import Friendship
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    FriendshipSerializer
)

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Update user online status
        self.user.is_online = True
        self.user.last_seen = timezone.now()
        self.user.save()

        # Add custom claims
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'full_name': self.user.get_full_name(),
            'profile_picture_url': self.user.profile_picture.url if self.user.profile_picture else None
        }

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer


class UserDetailView(generics.RetrieveAPIView):
    """View any user's profile"""
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = User.objects.annotate(
        posts_count=Count('posts'),
    )
    lookup_field = 'id'


class UserSearchView(generics.ListAPIView):
    """Search for users"""
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return User.objects.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(email__icontains=query)
            ).exclude(id=self.request.user.id)[:20]
        return User.objects.none().order_by('first_name')


# Friendship Views
class SendFriendRequestView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, user_id):
        try:
            to_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if to_user == request.user:
            return Response(
                {'error': 'Cannot send friend request to yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if friendship already exists
        existing = Friendship.objects.filter(
            Q(from_user=request.user, to_user=to_user) |
            Q(from_user=to_user, to_user=request.user)
        ).first()

        if existing:
            if existing.status == 'accepted':
                return Response(
                    {'error': 'Already friends'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif existing.status == 'pending':
                return Response(
                    {'error': 'Friend request already sent'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        friendship = Friendship.objects.create(
            from_user=request.user,
            to_user=to_user,
            status='pending'
        )

        return Response(
            FriendshipSerializer(friendship, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class RespondFriendRequestView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, friendship_id):
        try:
            friendship = Friendship.objects.get(
                id=friendship_id,
                to_user=request.user,
                status='pending'
            )
        except Friendship.DoesNotExist:
            return Response(
                {'error': 'Friend request not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        action = request.data.get('action')

        if action == 'accept':
            friendship.status = 'accepted'
            friendship.save()
            message = 'Friend request accepted'
        elif action == 'reject':
            friendship.status = 'rejected'
            friendship.save()
            message = 'Friend request rejected'
        else:
            return Response(
                {'error': 'Invalid action'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'message': message,
            'friendship': FriendshipSerializer(friendship, context={'request': request}).data
        })


class FriendRequestListView(generics.ListAPIView):
    """List pending friend requests received"""
    serializer_class = FriendshipSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Friendship.objects.filter(
            to_user=self.request.user,
            status='pending'
        ).select_related('from_user').order_by('-created_at')


class FriendsListView(generics.ListAPIView):
    """List all friends"""
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user

        # Get accepted friendships
        friend_ids = set()

        # Friendships where user sent request
        sent = Friendship.objects.filter(
            from_user=user,
            status='accepted'
        ).values_list('to_user_id', flat=True)
        friend_ids.update(sent)

        # Friendships where user received request
        received = Friendship.objects.filter(
            to_user=user,
            status='accepted'
        ).values_list('from_user_id', flat=True)
        friend_ids.update(received)

        return User.objects.filter(id__in=friend_ids)


class UnfriendView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, user_id):
        try:
            friendship = Friendship.objects.filter(
                Q(from_user=request.user, to_user_id=user_id) |
                Q(from_user_id=user_id, to_user=request.user),
                status='accepted'
            ).first()

            if not friendship:
                return Response(
                    {'error': 'Friendship not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            friendship.delete()

            return Response({
                'message': 'Unfriended successfully'
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )