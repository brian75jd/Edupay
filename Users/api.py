from Users.serializers import (ParentCreationSerializer, 
                               Response200Serializer,UserHistory200Response,
                               HeadTeacherCreationSerializer)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from drf_spectacular.utils import (
    extend_schema
)
from Payments.serializers import View404ResponseSerializer
from Users.utils import ParentCreationView,authenticate
from Payments.models import Transaction
from Users.models import ParentUserLogginSession
from Users.Exceptions import ParentUserException
from Users.serializers import TransactionSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth import login
from django.contrib.auth.hashers import check_password
import phonenumbers
from schools.models import School

User = get_user_model()




@extend_schema(
    request=ParentCreationSerializer,
    responses={
        200:Response200Serializer,
        400:View404ResponseSerializer,
    }
)
class UserCreationView(APIView):
    permission_classes = []

    @staticmethod
    def post(request,*args, **kwargs):
        try:
            serializer = ParentCreationSerializer(data = request.data)
            serializer.is_valid(raise_exception=True)

            user_created = ParentCreationView(validated_data = serializer.validated_data)
            if user_created:
                return Response({
                    'success':True,
                    'message':'Account created'
                })

        except Exception:
            raise


@extend_schema(
    request=ParentCreationSerializer,
    responses={
        200:Response200Serializer,
        400:View404ResponseSerializer,
    }
)
class UserLogginView(APIView):
    permission_classes = []

    @staticmethod
    def post(request,*args, **kwargs):
        try:
            phone_number = request.data.get('phone_number')
            pin = request.data.get('pin')

            user = authenticate(phone=phone_number,pin=pin,request=request)
            if user is None:
                return Response({
                    'success':False,
                    'message':"Invalid credentials"
                },status=400)

            return Response({
                'success':True,
                'message':"Success"
            },status=200)

        except Exception:
            raise


@extend_schema(
    responses={
        200: UserHistory200Response
    }
)
class UserHistory(APIView):
    permission_classes = []

    def get(self, request,*args, **kwargs):
        try:
            user = ParentUserLogginSession.objects.get(
                session_key = request.session.get('session_key')
            ).user
        except ParentUserLogginSession.DoesNotExist:
            raise ParentUserException()
        
        transaction = Transaction.objects.filter(
            user = user
        ).order_by('-date_created')
        serializer = TransactionSerializer(transaction, many=True)

        return Response({
            'success':True,
            'data':serializer.data
        })


class HeadTeacherCreation(APIView):

    def post(self,request,*args, **kwargs):
        try:
            serializer = HeadTeacherCreationSerializer(data = request.data)

            serializer.is_valid(raise_exception=True)

            user = User.objects.create_user(
                phone_number = serializer.validated_data.get('phone_number'),
                first_name = serializer.validated_data.get('first_name'),
                last_name = serializer.validated_data.get('last_name'),
                username = serializer.validated_data.get('first_name'),
                email = serializer.validated_data.get('email'),
                password= serializer.validated_data.get('password1')
            )

            login(request, user)
            return Response({
                'success':True,
                'msg':'Account created successfully'
            })

        except Exception as exp:
            print(exp)
            raise


class StaffLoginView(APIView):
    permission_classes = []

    def post(self, request):
        phone = request.data.get('phone')
        password = request.data.get('password')

        if not phone or not password:
            return Response({'success': False, 'detail': 'Phone and password are required'}, status=400)

        try:
            parsed = phonenumbers.parse(phone, 'MW')
            phone = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        except phonenumbers.NumberParseException:
            return Response({'success': False, 'detail': 'Invalid phone number'}, status=400)

        try:
            user = User.objects.get(phone_number=phone)
        except User.DoesNotExist:
            return Response({'success': False, 'detail': 'Invalid credentials'}, status=400)

        if not check_password(password, user.password):
            return Response({'success': False, 'detail': 'Invalid credentials'}, status=400)

        if not user.is_active:
            return Response({'success': False, 'detail': 'Account disabled'}, status=400)

        login(request, user)

        role = 'headteacher' if School.objects.filter(user=user).exists() else 'accountant'

        return Response({'success': True, 'role': role})


class StaffMeView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Not authenticated'}, status=401)

        school = School.objects.filter(user=request.user).first()
        is_headteacher = bool(school)
        if not school:
            school = School.objects.filter(accountants=request.user).first()

        data = {
            'id': request.user.id,
            'phone': request.user.phone_number,
            'firstName': request.user.first_name,
            'lastName': request.user.last_name,
            'email': request.user.email,
            'role': 'headteacher' if is_headteacher else 'accountant',
            'school': None,
        }
        if school:
            logo_url = None
            try:
                if school.logo:
                    logo_url = request.build_absolute_uri(school.logo.url)
            except Exception:
                pass
            data['school'] = {
                'id': school.id,
                'name': school.name,
                'location': school.location,
                'logo': logo_url,
                'fee_amount': str(school.fee_amount),
            }
        return Response(data)
