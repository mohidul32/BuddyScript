from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    UserProfileView,
    UserDetailView,
    UserSearchView,
    SendFriendRequestView,
    RespondFriendRequestView,
    FriendRequestListView,
    FriendsListView,
    UnfriendView,
)

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('users/<int:id>/', UserDetailView.as_view(), name='user-detail'),
    path('users/search/', UserSearchView.as_view(), name='user-search'),

    # Friendships
    path('friends/', FriendsListView.as_view(), name='friends-list'),
    path('friend-requests/', FriendRequestListView.as_view(), name='friend-requests'),
    path('friend-requests/send/<int:user_id>/', SendFriendRequestView.as_view(), name='send-friend-request'),
    path('friend-requests/<int:friendship_id>/respond/', RespondFriendRequestView.as_view(),
         name='respond-friend-request'),
    path('unfriend/<int:user_id>/', UnfriendView.as_view(), name='unfriend'),
]