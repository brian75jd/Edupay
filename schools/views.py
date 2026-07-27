from django.contrib.auth import get_user_model
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import PaymentMethod, School
from .permissions import IsAdminOrReadOnly
from django.contrib.auth.hashers import make_password
import secrets
import string
import phonenumbers

User = get_user_model()
from Payments.models import Transaction
from .serializers import (
    AccountantSerializer,
    PaymentMethodSerializer,
    SchoolDetailSerializer,
    SchoolListSerializer,
    SchoolRegistrationSerializer,
    SchoolStatusUpdateSerializer,

)
from rest_framework.views import APIView
import logging



logger = logging.getLogger(__name__)


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
        try:
            serializer = SchoolRegistrationSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = request.user
            if not user:
                return Response({
                    'success':False,
                    'detail':'You need to be logged in to perfom this operation'
                },status=400)
            
            phone = serializer.validated_data.get('phone', '')
            School.objects.create(
                user=user,
                name=serializer.validated_data['name'],
                location=serializer.validated_data['location'],
                school_type=serializer.validated_data['type'].upper(),
                postal_address=serializer.validated_data['postal_address'],
                email=serializer.validated_data['email'],
                phone_numbers=[phone] if phone else [],
                fee_amount=serializer.validated_data.get('fee_amount', 0),
                official_document=request.FILES['official_document'],
            )

            return Response({
                'success':True,
                'message':'School was created'
            },status=200)

        except Exception:
            logger.exception()
            return Response({
                'success':False,
                'message':'server error'
            })

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

        if self.action == "create":
            return [IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):

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


class AccountantView(APIView):
    permission_classes = [IsAuthenticated]

    def get_school(self, request):
        school = School.objects.filter(user=request.user).first()
        if not school:
            school = School.objects.filter(accountants=request.user).first()
        return school

    def get(self, request, pk=None):
        if pk:
            return self.retrieve(request, pk)
        return self.list(request)

    def post(self, request):
        return self.create(request)

    def patch(self, request, pk=None):
        return self.update(request, pk)

    def delete(self, request, pk=None):
        return self.destroy(request, pk)

    def list(self, request):
        school = self.get_school(request)
        if not school:
            return Response({'detail': 'No school found for this user'}, status=400)
        accountants = school.accountants.all()
        serializer = AccountantSerializer(accountants, many=True)
        return Response(serializer.data)

    def create(self, request):
        first_name = request.data.get('firstName', '').strip()
        last_name = request.data.get('lastName', '').strip()
        email = request.data.get('email', '').strip()
        phone = request.data.get('phone', '').strip()

        if not all([first_name, last_name, email, phone]):
            return Response({'detail': 'All fields are required'}, status=400)

        try:
            parsed = phonenumbers.parse(phone, 'MW')
            phone = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        except phonenumbers.NumberParseException:
            return Response({'detail': 'Invalid phone number'}, status=400)

        if User.objects.filter(phone_number=phone).exists():
            return Response({'detail': 'An account with this phone number already exists'}, status=400)

        default_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))

        user = User.objects.create_user(
            username=first_name.lower() + str(User.objects.count()),
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone_number=phone,
            password=default_password,
        )

        school = School.objects.filter(user=request.user).first()
        if school:
            school.accountants.add(user)

        serializer = AccountantSerializer(user)
        data = serializer.data
        data['default_password'] = default_password
        return Response(data, status=201)

    def retrieve(self, request, pk):
        school = self.get_school(request)
        if not school:
            return Response({'detail': 'No school found for this user'}, status=400)
        try:
            user = school.accountants.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Accountant not found'}, status=404)
        serializer = AccountantSerializer(user)
        return Response(serializer.data)

    def update(self, request, pk):
        school = self.get_school(request)
        if not school:
            return Response({'detail': 'No school found for this user'}, status=400)
        try:
            user = school.accountants.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Accountant not found'}, status=404)

        if 'firstName' in request.data:
            user.first_name = request.data['firstName'].strip()
        if 'lastName' in request.data:
            user.last_name = request.data['lastName'].strip()
        if 'email' in request.data:
            user.email = request.data['email'].strip()
        if 'phone' in request.data:
            phone = request.data['phone'].strip()
            try:
                parsed = phonenumbers.parse(phone, 'MW')
                phone = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
            except phonenumbers.NumberParseException:
                return Response({'detail': 'Invalid phone number'}, status=400)
            user.phone_number = phone
        user.save()

        serializer = AccountantSerializer(user)
        return Response(serializer.data)

    def destroy(self, request, pk):
        school = self.get_school(request)
        if not school:
            return Response({'detail': 'No school found for this user'}, status=400)
        try:
            user = school.accountants.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Accountant not found'}, status=404)

        school.accountants.remove(user)
        user.delete()
        return Response(status=204)


class SchoolMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get_school(self, request):
        school = School.objects.filter(user=request.user).first()
        if not school:
            school = School.objects.filter(accountants=request.user).first()
        return school

    def get(self, request):
        school = self.get_school(request)
        if not school:
            return Response({'detail': 'No school found for this user'}, status=400)
        data = SchoolDetailSerializer(school).data
        if school.logo:
            data['logo'] = request.build_absolute_uri(school.logo.url)
        return Response(data)

    def patch(self, request):
        school = School.objects.filter(user=request.user).first()
        if not school:
            return Response({'detail': 'Only the headteacher can update school info'}, status=403)
        for field in ('name', 'location', 'postal_address', 'email', 'website_url', 'fee_amount'):
            if field in request.data:
                setattr(school, field, request.data[field])
        if 'school_type' in request.data:
            school.school_type = request.data['school_type'].lower()
        if 'phone' in request.data:
            school.phone_numbers = [request.data['phone']]
        school.save()
        return Response(SchoolDetailSerializer(school).data)


class StudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        school = School.objects.filter(user=request.user).first()
        if not school:
            school = School.objects.filter(accountants=request.user).first()
        if not school:
            return Response({'detail': 'No school found for this user'}, status=400)

        from_param = request.query_params.get('from')
        to_param = request.query_params.get('to')
        term_param = request.query_params.get('term')

        qs = Transaction.objects.filter(school=school)
        if from_param:
            qs = qs.filter(date_created__gte=from_param)
        if to_param:
            qs = qs.filter(date_created__lte=to_param)
        qs = qs.order_by('-date_created')

        seen = {}
        for t in qs:
            name = (t.paid_for or '').strip()
            if not name:
                continue
            if name in seen:
                seen[name]['amount'] += t.amount
            else:
                seen[name] = {
                    'name': name,
                    'level': '',
                    'phone': t.contact or '',
                    'amount': t.amount,
                    'date': t.date_created.strftime('%Y-%m-%d') if t.date_created else '',
                    'term': '',
                }

        return Response(list(seen.values()))
