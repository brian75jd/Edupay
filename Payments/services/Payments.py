import requests
from django.conf import settings
import uuid
from django.db import transaction as db_transansaction
from .Exceptions import (PaymentCredentialException, 
                         SchoolNotFoundException,
                         SchoolExceptionError,
                         RequestTimeoutException)
from Payments.models import Transaction
import secrets
from .utils import calculate_total_amount
import logging


PAYCHANGU_SECRET_KEY = settings.PAY_SECRET_KEY


logger = logging.getLogger(__name__)


class PaychanguInitiatePayment:
    @staticmethod
    def initiate_payment(validated_data: dict)->dict:
        try:
            print(PAYCHANGU_SECRET_KEY)
            amount = validated_data.get('amount')
            student_first_name = validated_data.get('student_first_name')
            student_last_name = validated_data.get('student_last_name')
            school_id = validated_data.get('school_id')
            student_grade = validated_data.get('student_grade')

            if not all([amount,student_first_name, student_last_name]):
                raise PaymentCredentialException('Amount, student first and last names are required')

            with db_transansaction.atomic():            
                calculate_total = calculate_total_amount(amount = amount)
                trans_fee = calculate_total[1]
                total_amount = calculate_total[0]

                transaction=Transaction.objects.create(
                    status = 'pending',
                    trans_fee = trans_fee,
                    amount = total_amount,
                    trans_ref = secrets.token_hex(8)
                )
                  
                tx_ref = str(transaction.id)

                url = 'https://api.paychangu.com/payment'
                payload ={
                    'amount':f"{total_amount}",
                    'currency':'MKW',
                    "tx_ref": tx_ref,
                    'first_name':student_first_name,
                    'last_name':student_last_name,
                    "email":'brian75jd@gmail.com',
                    "callback_url":'http://localhost:8000/callback/',
                    "webhook_url":'http://localhost:8000/api/payment/webhook/',
                    'return_url':'http://localhost:8000/api/payment/webhook/'
                }

                headers ={
                    'accept':'application/json',
                    'Content-Type':'application/json',
                    'Authorization':PAYCHANGU_SECRET_KEY
                }
                try:
                    response = requests.post(
                        url=url, json=payload, headers=headers, timeout=300
                    )

                except requests.exceptions:
                    raise RequestTimeoutException('Request timeout.Try again')

                data = response.json()
                if not data['status'] =="success":
                    print(response.text)
                    raise RequestTimeoutException(f'{str(response.text)}')

                checkout_url = data['checkout_url']
                return{
                    'success':True,
                    'checkout_url':checkout_url
                }

        except Exception:
            logger.exception("ERROR")
            raise
                



        except Exception:
            raise
                