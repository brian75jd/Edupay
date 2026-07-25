from rest_framework.routers import DefaultRouter

from .views import PaymentMethodViewSet, SchoolViewSet

app_name = "schools"

router = DefaultRouter()
router.register(r"schools", SchoolViewSet, basename="school")
router.register(r"payment-methods", PaymentMethodViewSet, basename="paymentmethod")

urlpatterns = router.urls
