from django.contrib import admin

from .models import PaymentMethod, School


class PaymentMethodInline(admin.TabularInline):
    model = PaymentMethod
    extra = 0
    fields = ("payment_type", "provider", "account_no", "is_active")


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ("name", "status", "email", "website_url", "created_at")
    list_filter = ("status",)
    search_fields = ("name", "email", "postal_address")
    readonly_fields = ("created_at", "updated_at")
    inlines = [PaymentMethodInline]
    actions = ["approve_schools", "deny_schools", "suspend_schools"]

    @admin.action(description="Approve selected schools")
    def approve_schools(self, request, queryset):
        queryset.update(status=School.STATUS.APPROVED)

    @admin.action(description="Deny selected schools")
    def deny_schools(self, request, queryset):
        queryset.update(status=School.STATUS.DENIED)

    @admin.action(description="Suspend selected schools")
    def suspend_schools(self, request, queryset):
        queryset.update(status=School.STATUS.SUSPENDED)


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ("school", "provider", "payment_type", "account_no", "is_active")
    list_filter = ("payment_type", "is_active")
    search_fields = ("school__name", "provider", "account_no")
