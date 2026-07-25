from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.views import APIView
import logging
from drf_spectacular.utils import (
    extend_schema,
    OpenApiExample
)
from Payments.serializers import (InitiatePaymentResponseSerializer,
                                  View404ResponseSerializer,
                                  PaymentUserCredentials)



from Payments.services.Payments import PaychanguInitiatePayment
logger = logging.getLogger(__name__)



@extend_schema(
    request=PaymentUserCredentials,
    responses={
        200: InitiatePaymentResponseSerializer,
        400: View404ResponseSerializer
    }

)
class InitiatePayment(APIView):
    authentication_classes = []

    @staticmethod
    def post(request,*args, **kwargs):
        try:
            serializer = PaymentUserCredentials(data = request.data)

            serializer.is_valid(raise_exception=True)
            checkout = PaychanguInitiatePayment.initiate_payment(
                validated_data=serializer.validated_data
            )

            if checkout.get('success'):
                return Response({
                    'success':True,
                    'checkout_url': checkout.get('checkout_url')
                })

        except Exception:
            logger.exception('ERROR: ')
            raise


