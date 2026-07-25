from django.db import models
import uuid



class Transaction(models.Model):
    class STATUS(models.TextChoices):
        PENDING = 'pending',"Pending"
        SUCCESS = 'success','Success'
        FAILED = 'failed','Failed'
        
    id = models.UUIDField(primary_key=True, editable=False,default=uuid.uuid4)
    trans_ref = models.CharField(max_length=64)
    contact = models.CharField(max_length=15, null=True, blank=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    trans_fee = models.DecimalField(decimal_places=2, max_digits=15)
    status = models.CharField(max_length=30, choices=STATUS)
    paid_for = models.CharField(max_length=300, null=True,blank=True)
    date_created = models.DateTimeField(auto_now_add=True)



