from django.shortcuts import render
from django.http import FileResponse,Http404
from rest_framework.response import Response
from rest_framework.views import APIView
import logging
from drf_spectacular.utils import (
    extend_schema,
  
)
from Payments.serializers import (
    InitiatePaymentResponseSerializer,
    View404ResponseSerializer,
    PaymentUserCredentials,
    ReceiptSerializer
)
from Payments.models import Transaction,Receipt,LedgerEntry
from Payments.services.Payments import PaychanguInitiatePayment
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from Payments.services.utils import verify_signature
from Payments.services.Exceptions import PayChanguWebhookException
from Payments.permissions import HasSessionKey
from Payments.services.receipts import ReceiptGenerator, ReceiptPDF

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
                validated_data=serializer.validated_data,request=request
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
            print('data',data)

            tx_ref = data.get('tx_ref')
            resp_status = data.get('status')

            try:
                transaction = Transaction.objects.get(
                        id = tx_ref
                    )
            except Transaction.DoesNotExist:
                return Response({'success':False},status=404)

            if resp_status != "success":
                transaction.status = Transaction.STATUS.FAILED
                transaction.save(update_fields=['status'])
                return Response(status=200)

            transaction.status = Transaction.STATUS.SUCCESS
            transaction.save(update_fields=['status'])


            LedgerEntry.objects.create(
                amount_sent = transaction.amount,
                transanction = transaction,
                trans_fee = transaction.trans_fee,
                user = transaction.user,
                school = transaction.school
            )

            receipt = Receipt.objects.create(
                transanction = transaction,
                receipt_number = ReceiptGenerator.generate_ref()
            )
            ReceiptPDF.generate_receipt(receipt=receipt)

            return Response(status=200)
        

        except Exception as exp:
            logger.exception('ERROR: ')
            raise

          



def get_receipt(request,*args,**kwargs):
    tx_ref = request.GET.get('tx_ref')
    print(tx_ref)
    try:
        trans = Transaction.objects.get(
            id = tx_ref
        )
    
    except Transaction.DoesNotExist:
        return render(request, 'payment/not_found.html')

    receipt = Receipt.objects.get(
        transanction = trans
    )

    return FileResponse(
        receipt.pdf.open('rb'),
        content_type ='application/pdf'
    )