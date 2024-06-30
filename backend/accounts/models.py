from cloudinary.models import CloudinaryField, CloudinaryResource
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class User(AbstractUser):
    github_id = models.IntegerField(null=True, unique=True)
    username = models.CharField(max_length=150, unique=True, blank=True)
    email = models.EmailField(unique=True)
    profile_picture = CloudinaryField('image', null=True, blank=True)

    def __str__(self):
        return self.username
