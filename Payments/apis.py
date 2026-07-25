from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
import logging
from drf_spectacular.utils import (
    extend_schema,
  
)
from Payments.serializers import (
    InitiatePaymentResponseSerializer,
    View404ResponseSerializer,
    PaymentUserCredentials
)
from Payments.models import Transaction
from Payments.services.Payments import PaychanguInitiatePayment
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from Payments.services.utils import verify_signature
from Payments.services.Exceptions import PayChanguWebhookException
from Payments.permissions import HasSessionKey


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
    permission_classes = [HasSessionKey]

    @staticmethod
    def post(request, *args, **kwargs):
        try:
            serializer = PaymentUserCredentials(data=request.data)

            serializer.is_valid(raise_exception=True)
            checkout = PaychanguInitiatePayment.initiate_payment(
                validated_data=serializer.validated_data
            )

            if checkout.get('success'):
                return Response({
                    'success':True,
                    'checkout_url': checkout.get('checkout_url')
                })

            return Response({
                'detail':checkout.get('detail')
            })

        except Exception:
            logger.exception('ERROR: ')
            raise




@method_decorator(csrf_exempt,name='dispatch')
class Payment_Webhook(APIView):
    permission_classes = [AllowAny]

    @staticmethod
    def post(request, *args, **kwargs):

        if not verify_signature(request=request):
            raise PayChanguWebhookException()
        try:
            data = request.data

            tx_ref = data.get('tx_ref')
            resp_status = data.get('status')

            try:
                transaction = Transaction.objects.get(
                        trans_ref = tx_ref
                    )
            except Transaction.DoesNotExist:
                return Response({'success':False},status=404)

            if resp_status != "success":
                transaction.status = 'failed'
                transaction.save(update_fields=['status'])
                return Response(status=200)

            transaction.status = 'Failed'
            transaction.save(update_fields=['status'])

        except Exception as exp:
            logger.exption('ERROR: ')
            raise

          
