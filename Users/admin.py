from django.contrib import admin
from Users.models import *

@admin.register(ParentUsers)
class ParentUserAAdmin(admin.ModelAdmin):
    list_display = ('phone_number','hashed_password')
