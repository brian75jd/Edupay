from io import BytesIO

from django.core.files.base import ContentFile

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from Payments.models import Transaction,ReceiptsSequence,Receipt
from django.utils import timezone
from django.db import transaction


class ReceiptPDF:

    @staticmethod
    def generate_receipt(receipt):

        payment = receipt.transanction
        student = receipt.transanction.paid_for
        school = receipt.school

        buffer = BytesIO()

        doc = SimpleDocTemplate(buffer)

        styles = getSampleStyleSheet()

        elements = []

        elements.append(
            Paragraph(
                f"<b>Tarhet</b>",
                styles["Title"],
            )
        )

        elements.append(
            Paragraph(
                "<b>OFFICIAL PAYMENT RECEIPT</b>",
                styles["Heading2"],
            )
        )

        elements.append(Spacer(1, 20))

        data = [

            ["Receipt Number", receipt.receipt_number],

            ["Student", student],

            ["Student ID", student],

            ["Amount Paid", f"MWK {payment.amount}"],

 
            #["Gateway Ref", payment.gateway_reference],

            ["Status", payment.status],

            ["Date", receipt.created_at.strftime("%d %B %Y %H:%M")],

        ]

        table = Table(data, colWidths=[150, 300])

        table.setStyle(

            TableStyle([

                ("GRID", (0, 0), (-1, -1), 1, colors.grey),

                ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),

                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),

                ("TOPPADDING", (0, 0), (-1, -1), 8),

                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),

            ])

        )

        elements.append(table)

        elements.append(Spacer(1, 25))

        elements.append(

            Paragraph(

                "Generated electronically by EasyPay.<br/>"
                "No signature required.",

                styles["Normal"]

            )

        )

        doc.build(elements)

        buffer.seek(0)

        receipt.pdf.save(

            f"{receipt.receipt_number}.pdf",

            ContentFile(buffer.read()),

            save=True

        )

        buffer.close()


class ReceiptGenerator:

    @staticmethod
    @transaction.atomic
    def generate_ref():

        year = 2026

        sequence, _ = (
            ReceiptsSequence.objects
            .select_for_update()
            .get_or_create(year=year)
        )

        sequence.current_number += 1
        sequence.save()

        return (
            f"RCP-"
            f"{year}-"
            f"{sequence.current_number:06d}"
        )