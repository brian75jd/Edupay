from datetime import datetime
from django.db import transaction
from Payments.models import ReceiptsSequence


class ReceiptGenerator:
    @staticmethod
    @transaction.atomic
    def generate_receipt():
        year = 2026

        sequence,_ = (
            ReceiptsSequence.objects.select_for_update()
            .get_or_create(
                year = year
            ))

        sequence.current_number += 1
        sequence.save(update_fields=['current_number'])

        return (
            f"RCP"
            f"{year} - {sequence.current_number:06d}"
        )
