# EasyPay – School Fee Payment Platform

## Overview

EasyPay is a digital school fee payment platform developed for the National Bank of Malawi Hackathon.

The platform enables parents and guardians to pay school fees online using supported payment methods without physically visiting a bank or the school accounts office.

Once payment is completed, the system automatically verifies the transaction, updates the payment records, generates an official receipt, and makes it available for download.

The goal of the project is to simplify school fee collection while improving transparency, accuracy, and convenience for both schools and parents.

---

# Key Features

- Secure online school fee payments
- Hosted payment checkout
- Automatic payment verification
- Webhook-based payment confirmation
- PDF receipt generation
- Downloadable payment receipts
- Transaction history
- Payment status tracking
- REST API with Swagger Documentation

---

# Technologies Used

## Backend

- Python 3
- Django
- Django REST Framework

## API Documentation

- drf-spectacular (Swagger/OpenAPI)

## Database

- SQLite (Development)

The project can easily be configured to use PostgreSQL in production.

## PDF Generation

- ReportLab

## Payment Gateway

- PayChangu

## Version Control

- Git
- GitHub

---

# System Architecture

The project follows a layered architecture to separate responsibilities.

```
Views
│
├── Handle HTTP Requests
│
▼
Services
│
├── Payment Initialization
├── Payment Verification
├── Receipt Generation
└── Business Logic
│
▼
Models
│
├── Payment
├── Receipt
├── ReceiptSequence
└── Student
```

Business logic has been separated into service classes to improveve maintainability and readability.

---

# Payment Flow

1. Parent selects a student.
2. Parent enters payment details.
3. EasyPay creates a pending payment.
4. Parent is redirected to the hosted PayChangu checkout page.
5. Parent completes payment.
6. PayChangu sends a webhook.
7. EasyPay verifies the payment.
8. Payment status is updated.
9. A receipt number is generated.
10. A PDF receipt is generated.
11. Parent can download the receipt.

---

# Security

The project includes several security practices including:

- Transaction references for every payment
- Webhook verification
- Atomic database transactions
- Unique receipt generation
- Database row locking using `select_for_update()`
- Protection against duplicate receipt generation
- Separation of business logic into service classes

---

# Receipt Generation

Receipts are generated only after successful payment verification.

Each receipt contains:

- Unique receipt number
- Student information
- School information
- Payment amount
- Payment method
- Gateway reference
- Transaction reference
- Date of payment

Receipts are generated as PDF documents using ReportLab.

---

# API Documentation

Swagger documentation is available after running the project.

```
/api/docs/
```

---

# Installation

Clone the repository

```bash
git clone <repository-url>
```

Create a virtual environment

```bash
python -m venv venv
```

Activate the virtual environment

Windows

```bash
venv\Scripts\activate
```

Linux/macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run migrations

```bash
python manage.py migrate
```

Run the server

```bash
python manage.py runserver
```

Open

```
http://127.0.0.1:8000/
```

Swagger Documentation

```
http://127.0.0.1:8000/api/docs/
```

---

# Project Structure

```
payments/

├── models.py
├── serializers.py
├── views.py
├── urls.py
├── exceptions.py

services/

├── payment_service.py
├── webhook_service.py
├── receipt_generator.py
├── receipt_pdf.py

```

---

# Future Improvements

- Email receipts
- SMS notifications
- Parent dashboard
- Student balance tracking
- School analytics
- Multiple payment gateways
- PostgreSQL deployment
- Docker support

---
![image](https://github.com/brian75jd/Edupay/blob/f241cfbf112d9b895eb2ac11c8fab48d2ba26a2f/Screenshot_20260727_080535_com.android.chrome.jpg)


#EasyPay hosting link
https://edupay-dgbc.onrender.com

Since the current hosting platform has issues rendering schools on the landing page, readers are adviced to natigate to https://edupay-dgbc.onrender.com/pay-fees/1/ to experience the full logic


![image] (https://github.com/brian75jd/Edupay/blob/b2223bff5be4f85723726840903fce8f18882ef3/Screenshot_20260727_080747_com.android.chrome.jpg) 

![image](https://github.com/brian75jd/Edupay/blob/983426162f2d3f511e82fe0d6d407b0e29095630/Screenshot_20260727_080735_com.android.chrome.jpg) 

![image](https://github.com/brian75jd/Edupay/blob/7a4ed70f82cf65e2fd0c581755a1960d70d931dd/Screenshot_20260727_080735_com.android.chrome.jpg)

