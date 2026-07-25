from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    phone_number = models.CharField(max_length = 20, null=True, blank=True)



class ParentUsers(models.Model):
    phone_number = models.CharField(max_length=15,unique = True)
    hashed_password = models.CharField(max_length=300)
    is_active = models.BooleanField(default=True)
    date_created = models.DateTimeField(auto_now_add=True)
