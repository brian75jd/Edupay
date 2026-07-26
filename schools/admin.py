from django.contrib import admin
from django.utils.html import format_html

from .models import PaymentMethod, School, StaffAccount


class PaymentMethodInline(admin.TabularInline):
    model = PaymentMethod
    extra = 0
    fields = ("payment_type", "provider", "account_no", "is_active")


class StaffAccountInline(admin.TabularInline):
    model = StaffAccount
    extra = 0
    fields = ("phone_number", "role", "first_name", "last_name", "is_active")


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ("name", "status", "email", "document_link", "created_at")
    list_filter = ("status",)
    search_fields = ("name", "email", "postal_address")
    readonly_fields = ("created_at", "updated_at")
    inlines = [StaffAccountInline, PaymentMethodInline]
    actions = ["approve_schools", "deny_schools", "suspend_schools"]

    def document_link(self, obj):
        if not obj.official_document:
            return "-"
        return format_html(
            '<a href="{}" target="_blank">View document</a>', obj.official_document.url
        )

    document_link.short_description = "Evidence"

    @admin.action(description="Approve selected schools")
    def approve_schools(self, request, queryset):
        queryset.update(status=School.Status.APPROVED)

    @admin.action(description="Deny selected schools")
    def deny_schools(self, request, queryset):
        queryset.update(status=School.Status.DENIED)

    @admin.action(description="Suspend selected schools")
    def suspend_schools(self, request, queryset):
        queryset.update(status=School.Status.SUSPENDED)


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ("school", "provider", "payment_type", "account_no", "is_active")
    list_filter = ("payment_type", "is_active")
    search_fields = ("school__name", "provider", "account_no")


@admin.register(StaffAccount)
class StaffAccountAdmin(admin.ModelAdmin):
    list_display = ("phone_number", "school", "role", "first_name", "last_name", "is_active")
    list_filter = ("role", "is_active")
    search_fields = ("phone_number", "first_name", "last_name", "school__name")
