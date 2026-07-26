from Users.models import ParentUsers
from rest_framework import serializers
from .utils import validate_phone
from Payments.models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id','paid_for','status','date_created','amount']


class UserHistory200Response(serializers.Serializer):
    id = serializers.UUIDField()
    paid_for = serializers.CharField()
    status = serializers.CharField()
    date_created = serializers.DateTimeField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)


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

