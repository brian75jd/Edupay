from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import PaymentMethod, School
from .permissions import IsAdminOrReadOnly
from .serializers import (
    PaymentMethodSerializer,
    SchoolDetailSerializer,
    SchoolListSerializer,
    SchoolRegistrationSerializer,
    SchoolStatusUpdateSerializer,
)
from rest_framework.views import APIView

class SchoolView(APIView):
    def get(self,request,*args,**kwargs):

        query_set = School.objects.filter(
            status = School.STATUS.APPROVED
        )
        serializer = SchoolDetailSerializer(query_set, many=True)

        return Response({
            'success':True,
            'data':serializer.data
        },status = 200)


class CreateSchoolView(APIView):
    permission_classes =[]

    def post(self,request,*args, **kwargs):
        serializer = SchoolRegistrationSerializer()

class SchoolViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/schools/?search=            list/search (approved only, public)
    POST   /api/v1/schools/                     register a new school (status -> pending)
    GET    /api/v1/schools/{id}/                retrieve a school's profile
    PATCH  /api/v1/schools/{id}/status/         approve/deny/suspend (admin only)
    GET    /api/v1/schools/{id}/payment-methods/  active disbursement channels
    """

    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "postal_address"]

    def get_queryset(self):
        qs = School.objects.all()
        user = self.request.user
        is_staff_user = bool(user and user.is_authenticated and user.is_staff)
        # Public listing only ever surfaces approved schools; staff can see everything
        # (including pending/denied/suspended) for moderation and support.
        if self.action == "list" and not is_staff_user:
            qs = qs.filter(status=School.Status.APPROVED)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return SchoolListSerializer
        if self.action == "create":
            return SchoolRegistrationSerializer
        if self.action == "update_status":
            return SchoolStatusUpdateSerializer
        return SchoolDetailSerializer

    def get_permissions(self):
        # Registering a school requires an account (headteacher/accountant),
        # but doesn't require staff privileges. Everything else follows
        # IsAdminOrReadOnly.
        if self.action == "create":
            return [IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        # The school starts as 'pending' (enforced in the serializer) until
        # an EduPay admin manually reviews the uploaded official_document
        # and approves it. The registering user is linked to the new school
        # so they become its headteacher/accountant.
        school = serializer.save()
        user = self.request.user
        if hasattr(user, "school"):
            user.school = school
            user.save(update_fields=["school"])

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
    """Admin-facing CRUD for schools' bank/mobile disbursement channels."""

    queryset = PaymentMethod.objects.select_related("school").all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["school__name", "provider", "account_no"]
