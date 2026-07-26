from django.urls import path
from rest_framework.routers import DefaultRouter

from . import api
from .views import PaymentMethodViewSet, SchoolViewSet

app_name = "schools"

router = DefaultRouter()
router.register(r"schools", SchoolViewSet, basename="school")
router.register(r"payment-methods", PaymentMethodViewSet, basename="paymentmethod")

urlpatterns = router.urls + [
    path("v1/register/", api.RegisterSchoolView.as_view(), name="register_school"),
    path("v1/staff/login/", api.StaffLoginView.as_view(), name="staff_login"),
    path("v1/staff/add-accountant/", api.AddAccountantView.as_view(), name="add_accountant"),
    path("v1/staff/change-credentials/", api.ChangeCredentialsView.as_view(), name="change_credentials"),
]
