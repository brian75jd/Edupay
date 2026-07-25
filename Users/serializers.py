from Users.models import ParentUsers
from rest_framework import serializers
from .utils import validate_phone


class ParentCreationSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    pin_code = serializers.CharField(min_length = 3)


    def validate_phone_number(self,value):
        validated = validate_phone(phone = value)

        if not validated.get('success'):
            error = validated.get('error')
            raise serializers.ValidationError(
                f"{error}"
            )

        return value

    def validate_pin_code(self, value):
        if len(value) < 3:
            raise serializers.ValidationError(
                'PIN can not have less than 3 characters'
            )

        raise value