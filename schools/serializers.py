from rest_framework import serializers

from .models import PaymentMethod, School, StaffAccount


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
        fields = ["id", "name", "postal_address", "logo", "status", "website_url"]


class SchoolDetailSerializer(serializers.ModelSerializer):
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


class SchoolStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ["status"]


class StaffAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffAccount
        fields = [
            "id",
            "school",
            "role",
            "first_name",
            "last_name",
            "phone_number",
            "must_change_password",
            "is_active",
            "date_created",
        ]
        read_only_fields = fields


class HeadteacherRegistrationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    postal_address = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    official_document = serializers.FileField()
    logo = serializers.ImageField(required=False)
    phone_numbers = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    website_url = serializers.URLField(required=False, allow_blank=True)

    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone_number = serializers.CharField(max_length=20)
    password = serializers.CharField(max_length=128, write_only=True, min_length=8)

    def validate(self, attrs):
        school_fields = [
            "name",
            "postal_address",
            "email",
            "official_document",
            "logo",
            "phone_numbers",
            "website_url",
        ]
        account_fields = ["first_name", "last_name", "phone_number", "password"]

        return {
            "school": {k: attrs[k] for k in school_fields if k in attrs},
            "account": {k: attrs[k] for k in account_fields if k in attrs},
        }


class StaffLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)


class AddAccountantSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone_number = serializers.CharField(max_length=20)


class ChangeCredentialsSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_phone_number = serializers.CharField(max_length=20, required=False)
    new_password = serializers.CharField(
        max_length=128, required=False, write_only=True, min_length=8
    )
