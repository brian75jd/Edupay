from Users.models import ParentUsers
from rest_framework import serializers
from .utils import validate_phone


class Response200Serializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()


class ParentCreationSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    pin_code = serializers.CharField(max_length = 30)


    def validate_phone_number(self,value):
        validated = validate_phone(phone = value)

        if not validated.get('success'):
            error = validated.get('error')
            raise serializers.ValidationError(
                f"{error}"
            )

        value = validated.get('phone')
        return value

