from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import PaymentMethod, School

User = get_user_model()


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
            'location',
            'postal_address',
            'fee_amount'

        ]


class SchoolRegistrationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length = 300)
    location = serializers.CharField(max_length=300)
    type = serializers.CharField(max_length = 50)


    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError(
                'School name is required'
            )

        return value
    
    def validate_location(self, value):
        if not value:
            raise serializers.ValidationError(
                'Location name is required'
            )

        return value
    
    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError(
                'Type is required'
            )

        return value

    


class SchoolStatusUpdateSerializer(serializers.ModelSerializer):
    """Admin-only: approve / deny / suspend a school."""

    class Meta:
        model = School
        fields = ["status"]


class AccountantSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    phone = serializers.CharField(source='phone_number')
    dateJoined = serializers.DateTimeField(source='date_joined')
    lastLogin = serializers.DateTimeField(source='last_login')

    class Meta:
        model = User
        fields = [
            'id', 'firstName', 'lastName', 'email', 'phone',
            'is_active', 'dateJoined', 'lastLogin',
        ]
