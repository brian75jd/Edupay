from django.contrib import admin
from .models import Transaction, Receipt

@admin.register(Transaction)
class TransanctionAdmin(admin.ModelAdmin):
    list_display = ('trans_ref','school__name',"amount",'status')
    ordering = ('-date_created',)


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('id','receipt_number','created_at')
