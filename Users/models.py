from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    phone_number = models.CharField(max_length = 20, null=True, blank=True)



class ParentUsers(models.Model):
    phone_number = models.CharField(max_length=15,unique = True)
    hashed_password = models.CharField(max_length=300)
    is_active = models.BooleanField(default=True)
    date_created = models.DateTimeField(auto_now_add=True)



class ParentUserLogginSession(models.Model):
    id = models.UUIDField(primary_key = True, default=uuid.uuid4,editable=False)
    session_key = models.CharField(max_length = 64)
    user = models.ForeignKey(ParentUsers,on_delete=models.CASCADE)
    is_valid = models.BooleanField(default=True)
    date_created = models.DateTimeField(auto_now_add = True)

    @property
    def session_expired(self):
        return (
            timezone.now() > self.date_created + timedelta(minutes=10)
            )


    @property
    def invalidate_session(self):
        self.is_valid = False
        self.save(update_fields=['is_valid'])
        