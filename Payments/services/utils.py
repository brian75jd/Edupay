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
    paychangu_signature = request.headers.get('signature')

    payload = request.body

    signed_signature = hmac.new(
        PAYCHANGU_SECRET_KEY.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(paychangu_signature, signed_signature)



"""
data {'event_type': 'checkout.payment', 'first_name': 'Bizwick', 'last_name': 'James', 'email': 'brian75jd@gmail.com', 'currency': 'MWK', 'amount': 9180, 'charge': 275.4, 'amount_split': {'fee_paid_by_customer': 0, 'fee_paid_by_merchant': 275.4, 'total_amount_paid_by_customer': 9180, 'amount_received_by_merchant': 8904.6}, 'total_amount_paid': 9180, 'mode': 'test', 'type': 'API Payment (Checkout)', 'status': 'success', 'reference': '67562777464', 'tx_ref': '4bc0b234-412e-4d10-bfe8-53cb3e4eedc8', 'customization': {'title': None, 'description': None, 'logo': None}, 'meta': 'null', 'customer': {'customer_ref': 'cs_42fa5c1c646ac2e', 'email': 'brian75jd@gmail.com', 'first_name': 'Brian', 'last_name': 'Bingala', 'phone': '998063700', 'created_at': 1776975712, 'merchant_reference_identifier': None}, 'authorization': {'channel': 'Mobile Money', 'card_details': None, 'bank_payment_details': None, 'mobile_money': {'mobile_number': '+265992232796', 'operator': 'TNM Mpamba', 'trans_id': 'zwTmWOp0qd'}, 'completed_at': '2026-07-26T00:54:48.000000Z'}, 'created_at': '2026-07-26T00:54:48.000000Z', 'completed_at': '2026-07-26T00:54:48.000000Z'}

"""