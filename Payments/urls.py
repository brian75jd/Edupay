from django.urls import path
from Payments import views


urlpatterns = [
    path('v1/initiate_payment/',views.InitiatePayment.as_view(),name='initate_payment')
]


