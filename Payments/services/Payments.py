import requests
from django.conf import settings
from schools.models import School
from django.db import transaction as db_transansaction
from .Exceptions import (PaymentCredentialException, 
                         SchoolNotFoundException,
                         SchoolExceptionError,
                         RequestTimeoutException,UserNotFound)
from Payments.models import Transaction
import secrets
from .utils import calculate_total_amount
import logging
from Users.models import ParentUserLogginSession

PAYCHANGU_SECRET_KEY = settings.PAY_SECRET_KEY


logger = logging.getLogger(__name__)


class PaychanguInitiatePayment:
    @staticmethod
    def initiate_payment(validated_data: dict, request)->dict:
        try:
            print(PAYCHANGU_SECRET_KEY)
            amount = validated_data.get('amount')
            student_first_name = validated_data.get('student_first_name')
            student_last_name = validated_data.get('student_last_name')
            school_id = validated_data.get('school_id')
            student_grade = validated_data.get('student_grade')

            if not all([amount,student_first_name, student_last_name]):
                raise PaymentCredentialException('Amount, student first and last names are required')

            try:
                school = School.objects.get(id=school_id)

            except School.DoesNotExist:
                raise SchoolNotFoundException('School does not exist')

            if not school.status.lower() =="approved":
                raise SchoolExceptionError('School is not approve to receive payments')

            session_key = request.session.get('session_key')
            try:
                user = ParentUserLogginSession.objects.get(
                    session_key = session_key
                ).user

            except ParentUserLogginSession.DoesNotExist:
                raise UserNotFound()
        

            with db_transansaction.atomic():            
                calculate_total = calculate_total_amount(amount = amount)
                trans_fee = calculate_total[1]
                total_amount = calculate_total[0]

                transaction=Transaction.objects.create(
                    status = 'pending',
                    trans_fee = trans_fee,
                    amount = total_amount,
                    trans_ref = secrets.token_hex(8),
                    school = school,
                    user = user,
                    paid_for = f"{student_first_name} {student_last_name}"
                )
                  
                tx_ref = str(transaction.id)

                url = 'https://api.paychangu.com/payment'
                payload ={
                    'amount':f"{total_amount}",
                    'currency':'MWK',
                    "tx_ref": tx_ref,
                    'first_name':student_first_name,
                    'last_name':student_last_name,
                    "email":'brian75jd@gmail.com',
                    "callback_url":'https://kaylin-plumbic-luana.ngrok-free.dev/payment/v1/initiate_payment/',
                    "webhook_url":'https://kaylin-plumbic-luana.ngrok-free.dev/payment/api/webhook/',
                    'return_url':'https://kaylin-plumbic-luana.ngrok-free.dev/payment/v1/initiate_payment/'
                }

                headers ={
                    'accept':'application/json',
                    'Content-Type':'application/json',
                    'Authorization':f"Bearer {PAYCHANGU_SECRET_KEY}"
                }
                try:
                    request = requests.post(
                        url=url, json=payload, headers=headers, timeout=3000
                    )

                except requests.exceptions:
                    raise RequestTimeoutException('Request timeout.Try again')

                response = request.json()
            
                if not response.get("status") =="success":
                    print("ERROR:",request.text)
                    return{
                        'success':False,
                        'detail':str(request.text)
                    }

                print('DATA:',response)
                checkout_url = response["data"]["checkout_url"]
               
                if checkout_url:
                    return{
                        'success':True,
                        'checkout_url':checkout_url
                    }
                print("checkout_url not found")
                return{
                    'success':False,
                    'error':'error'
                }
            
        except Exception:
            logger.exception("ERROR")
            raise
                
                