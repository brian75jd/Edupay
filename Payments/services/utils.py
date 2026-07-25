from decimal import Decimal


def calculate_total_amount(amount)-> list:
    TRANSACTION_FEE_PERCENTAGE = Decimal("0.02")
    amount = Decimal(f"{amount}")
    transanction_fee =  Decimal(f"{amount *TRANSACTION_FEE_PERCENTAGE}")
    amount = amount + transanction_fee
    return [amount, transanction_fee]