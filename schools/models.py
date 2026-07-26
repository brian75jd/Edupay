from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid

phone_validator = RegexValidator(
    regex=r"^\+?\d{7,15}$",
    message="Enter a valid phone number (7-15 digits, optional leading '+').",
)


class School(models.Model):

    class Status(models.TextChoices):
        APPROVED = "approved", "Approved"
        PENDING = "pending", "Pending"
        DENIED = "denied", "Denied"
        SUSPENDED = "suspended", "Suspended"

    name = models.CharField(max_length=255, db_index=True)
    postal_address = models.CharField(max_length=255)
    logo = models.ImageField(upload_to="school_logos/", blank=True, null=True)
    email = models.EmailField()
    official_document = models.FileField(upload_to="school_documents/")
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    phone_numbers = models.JSONField(
        default=list,
        blank=True,
        help_text="List of contact phone numbers, e.g. ['+265991234567'].",
    )
    website_url = models.URLField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "School"
        verbose_name_plural = "Schools"

    def __str__(self):
        return self.name

    @property
    def is_approved(self) -> bool:
        return self.status == self.Status.APPROVED

    def clean(self):
        super().clean()
        for number in self.phone_numbers:
            phone_validator(number)


class PaymentMethod(models.Model):

    class PaymentType(models.TextChoices):
        BANK = "bank", "Bank"
        MOBILE = "mobile", "Mobile"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="payment_methods",
    )
    payment_type = models.CharField(max_length=10, choices=PaymentType.choices)
    provider = models.CharField(
        max_length=100,
        help_text="e.g. Airtel Money, NBS, NBM, TNM Mpamba.",
    )
    account_no = models.CharField(
        max_length=50,
        help_text="Bank account number (bank) or phone number (mobile).",
    )
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["school", "-is_active"]
        verbose_name = "Payment Method"
        verbose_name_plural = "Payment Methods"
        constraints = [
            models.UniqueConstraint(
                fields=["school", "payment_type", "account_no"],
                name="unique_school_payment_channel",
            )
        ]

    def __str__(self):
        return f"{self.school.name} - {self.provider} ({self.payment_type})"


class StaffAccount(models.Model):

    class Role(models.TextChoices):
        HEADTEACHER = "headteacher", "Headteacher"
        ACCOUNTANT = "accountant", "Accountant"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="staff_accounts"
    )
    role = models.CharField(max_length=20, choices=Role.choices)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, unique=True)
    hashed_password = models.CharField(max_length=300)
    must_change_password = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["school", "role", "last_name"]

    def __str__(self):
        return f"{self.phone_number} - {self.school.name} ({self.role})"


class StaffLoginSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_key = models.CharField(max_length=64)
    user = models.ForeignKey(StaffAccount, on_delete=models.CASCADE)
    is_valid = models.BooleanField(default=True)
    date_created = models.DateTimeField(auto_now_add=True)

    @property
    def session_expired(self):
        return timezone.now() > self.date_created + timedelta(hours=12)

    @property
    def invalidate_session(self):
        self.is_valid = False
        self.save(update_fields=["is_valid"])
