from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import PaymentMethod, School
from .permissions import IsAdminOrReadOnly
from .serializers import (
    PaymentMethodSerializer,
    SchoolDetailSerializer,
    SchoolListSerializer,
    SchoolStatusUpdateSerializer,
)


class SchoolViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "postal_address"]

    def get_queryset(self):
        qs = School.objects.all()
        user = self.request.user
        is_staff_user = bool(user and user.is_authenticated and user.is_staff)
        if self.action == "list" and not is_staff_user:
            qs = qs.filter(status=School.Status.APPROVED)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return SchoolListSerializer
        if self.action == "update_status":
            return SchoolStatusUpdateSerializer
        return SchoolDetailSerializer

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        school = self.get_object()
        serializer = self.get_serializer(school, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            SchoolDetailSerializer(school, context=self.get_serializer_context()).data
        )

    @action(detail=True, methods=["get"], url_path="payment-methods", permission_classes=[AllowAny])
    def payment_methods(self, request, pk=None):
        school = self.get_object()
        methods = school.payment_methods.filter(is_active=True)
        serializer = PaymentMethodSerializer(methods, many=True)
        return Response(serializer.data)


class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.select_related("school").all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["school__name", "provider", "account_no"]
