from Users.models import ParentUsers
from rest_framework import serializers
from .utils import validate_phone
from Payments.models import Transaction
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from Users.utils import general_validate_phone

User = get_user_model()

class HeadTeacherCreationSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length = 300)
    last_name = serializers.CharField(max_length = 300)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length = 300)
    password1 = serializers.CharField(max_length = 300)

    def validate_email(self,value):

        if User.objects.filter(email = value).exists():
            raise serializers.ValidationError(
                'Email already in use.Try another one'
            )

        return value

    def validate_password1(self,value):
        validate_password(value)

        return value


    def validate_phone_number(self,value):
        validate_phone = general_validate_phone(phone=value)

        if not validate_phone.get('success'):
            raise

        value = validate_phone.get('phone')

        return value

    





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

