from rest_framework import serializers
from Payments.models import Receipt


class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = ['id','pdf']

class PaymentUserCredentials(serializers.Serializer):
    student_first_name = serializers.CharField(
        max_length = 300
    )
    student_last_name = serializers.CharField(
        max_length = 300
    )

    amount = serializers.IntegerField()
    school_id = serializers.IntegerField()


    def validate_amount(self, value):
        try:
            value = int(value)
        except ValueError:
            raise serializers.ValidationError(
                'Amount must be an interger'
            )
        if value < 1000:
            raise serializers.ValidationError(
                'Amount must be greater that MKW1000 '
            )

        return value




class InitiatePaymentResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    checkout_url = serializers.URLField()


class View404ResponseSerializer(serializers.Serializer):
    error = serializers.CharField()
    success = serializers.BooleanField()