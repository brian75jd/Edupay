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
    
    class Meta:
        model = School
        fields = ["id", "name", "postal_address", "logo", "status", "website_url",
                  "school_type", "fee_amount", "email", "phone_numbers"]


class SchoolDetailSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = School
        fields = [
            "id",
            "name",
            "logo",
            'location'

        ]


class SchoolRegistrationSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length = 300)


    def create(self, validated_data):
        validated_data["status"] = School.Status.PENDING
        return super().create(validated_data)


class SchoolStatusUpdateSerializer(serializers.ModelSerializer):
    """Admin-only: approve / deny / suspend a school."""

    class Meta:
        model = School
        fields = ["status"]
