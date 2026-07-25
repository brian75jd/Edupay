from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransanctionAdmin(admin.ModelAdmin):
    list_display = ('trans_ref','school__name',"amount",'status')
    ordering = ('-date_created',)
