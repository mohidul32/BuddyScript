from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password=None):
        user = self.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    bio = models.TextField(max_length=500, blank=True, default='')  # NEW
    profile_picture = models.ImageField(  # NEW
        upload_to='profiles/%Y/%m/%d/',
        null=True,
        blank=True
    )
    cover_photo = models.ImageField(  # NEW
        upload_to='covers/%Y/%m/%d/',
        null=True,
        blank=True
    )
    location = models.CharField(max_length=100, blank=True, default='')  # NEW
    website = models.URLField(max_length=200, blank=True, default='')  # NEW
    is_online = models.BooleanField(default=False)  # NEW
    last_seen = models.DateTimeField(null=True, blank=True)  # NEW
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['date_joined']),
            models.Index(fields=['is_online']),  # NEW
        ]

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def posts_count(self):  # NEW
        return self.posts.count()

    @property
    def friends_count(self):  # NEW
        return self.friends_initiated.filter(status='accepted').count() + \
               self.friends_received.filter(status='accepted').count()


class Friendship(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    from_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='friends_initiated'
    )
    to_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='friends_received'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'friendships'
        unique_together = ('from_user', 'to_user')
        indexes = [
            models.Index(fields=['from_user', 'status']),
            models.Index(fields=['to_user', 'status']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.from_user.email} -> {self.to_user.email} ({self.status})"