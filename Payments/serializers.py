from rest_framework import serializers

class PaymentUserCredentials(serializers.Serializer):
    student_first_name = serializers.CharField(
        max_length = 300
    )
    student_last_name = serializers.CharField(
        max_length = 300
    )

    amount = serializers.IntegerField()


    def validate_amount(self, value):
        if type(value) != 'int':
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