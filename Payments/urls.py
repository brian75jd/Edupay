from django.urls import path
from Payments import views
from Payments import apis

urlpatterns = [
    path('v1/initiate_payment/',apis.InitiatePayment.as_view(),name='initate_payment'),
    path('api/webhook/',apis.Payment_Webhook.as_view(),name='webhook'),
    path('api/finish/',apis.get_receipt, name='receipt')
]


