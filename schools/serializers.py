from rest_framework import serializers

from .models import PaymentMethod, School


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = [
            "id",
            "school",
            "payment_type",
            "provider",
            "account_no",
            "is_active",
        ]
        read_only_fields = ["id"]


class SchoolListSerializer(serializers.ModelSerializer):
    """Lightweight representation used for search / list results."""

    class Meta:
        model = School
        fields = ["id", "name", "postal_address", "logo", "status", "website_url"]


class SchoolDetailSerializer(serializers.ModelSerializer):
    """Full representation used for a single school's profile."""

    payment_methods = PaymentMethodSerializer(many=True, read_only=True)

    class Meta:
        model = School
        fields = [
            "id",
            "name",
            "postal_address",
            "logo",
            "email",
            "official_document",
            "status",
            "phone_numbers",
            "website_url",
            "payment_methods",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at"]


class SchoolRegistrationSerializer(serializers.ModelSerializer):
    """Used when a school signs up. Status always starts as 'pending'."""

    class Meta:
        model = School
        fields = [
            "id",
            "name",
            "postal_address",
            "logo",
            "email",
            "official_document",
            "phone_numbers",
            "website_url",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        validated_data["status"] = School.Status.PENDING
        return super().create(validated_data)


class SchoolStatusUpdateSerializer(serializers.ModelSerializer):
    """Admin-only: approve / deny / suspend a school."""

    class Meta:
        model = School
        fields = ["status"]
