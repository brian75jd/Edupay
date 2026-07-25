from decimal import Decimal
from django.conf import settings
import hmac, hashlib


PAYCHANGU_SECRET_KEY = settings.PAY_SECRET_KEY


def calculate_total_amount(amount)-> list:
    TRANSACTION_FEE_PERCENTAGE = Decimal("0.02")
    amount = Decimal(f"{amount}")
    transanction_fee =  Decimal(f"{amount *TRANSACTION_FEE_PERCENTAGE}")
    amount = amount + transanction_fee
    return [amount, transanction_fee]



def verify_signature(request):
    paychangu_signature = request.header.get('signature')

    payload = request.body

    signed_signature = hmac.new(
        PAYCHANGU_SECRET_KEY,
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(paychangu_signature, signed_signature)
