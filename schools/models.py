from django.core.validators import RegexValidator
from django.db import models
from django.contrib.auth import get_user_model

phone_validator = RegexValidator(
    regex=r"^\+?\d{7,15}$",
    message="Enter a valid phone number (7-15 digits, optional leading '+').",
)


User = get_user_model()

class School(models.Model):

    class STATUS(models.TextChoices):
        APPROVED = "approved", "Approved"
        PENDING = "pending", "Pending"
        DENIED = "denied", "Denied"
        SUSPENDED = "suspended", "Suspended"

    class SchoolType(models.TextChoices):
        PRIMARY = "primary", "Primary School"
        SECONDARY = "secondary", "Secondary School"
        UNIVERSITY = "university", "University"
        COLLEGE = "college", "College"

    name = models.CharField(max_length=255, db_index=True)
    postal_address = models.CharField(max_length=255)
    logo = models.ImageField(upload_to="school_logos/", blank=True, null=True)
    email = models.EmailField()
    location = models.CharField(default="Lilongwe",max_length=300)
    official_document = models.FileField(upload_to="school_documents/")
    user = models.ForeignKey(User, on_delete=models.CASCADE,null=True,blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS.choices, default=STATUS.PENDING
    )
    phone_numbers = models.JSONField(
        default=list,
        blank=True,
        help_text="List of contact phone numbers, e.g. ['+265991234567'].",
    )
    website_url = models.URLField(blank=True, null=True)
    school_type = models.CharField(
        max_length=20, choices=SchoolType.choices, default=SchoolType.SECONDARY
    )
    fee_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    accountants = models.ManyToManyField(
        User,
        related_name="accountant_schools",
        blank=True,
    )

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
