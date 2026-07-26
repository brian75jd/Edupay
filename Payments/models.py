from django.db import models
import uuid
from schools.models import School
from Users.models import ParentUsers

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
    user = models.ForeignKey(ParentUsers,on_delete=models.PROTECT,related_name='transactions',null=True,blank=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE,
                               related_name = 'school_transactions',null=True,blank=True)
    paid_for = models.CharField(max_length=300, null=True,blank=True)
    date_created = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.id}"



class Receipt(models.Model):
    id = models.UUIDField(primary_key=True,editable=False,default=uuid.uuid4)
    transanction = models.OneToOneField(Transaction, on_delete=models.PROTECT,related_name = 'receipt')
    receipt_number =models.CharField(
        max_length=30, unique=True, null=True,blank=True
    )
    pdf= models.FileField(upload_to='receipts/',null=True, blank=False)
    created_at = models.DateTimeField(auto_now_add = True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.receipt_number


class ReceiptsSequence(models.Model):
    year = models.PositiveIntegerField(unique=True)
    current_number = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.year}-{self.current_number}"
    

