from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    AddAccountantSerializer,
    ChangeCredentialsSerializer,
    HeadteacherRegistrationSerializer,
    StaffAccountSerializer,
    StaffLoginSerializer,
)
from .utils import (
    add_accountant,
    authenticate_staff,
    change_credentials,
    get_authenticated_staff,
    register_headteacher,
)


class RegisterSchoolView(APIView):
    permission_classes = []
    parser_classes = [MultiPartParser, FormParser]

    @staticmethod
    def post(request, *args, **kwargs):
        serializer = HeadteacherRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        staff = register_headteacher(serializer.validated_data)

        return Response(
            {
                "success": True,
                "message": "School registered, pending approval",
                "staff": StaffAccountSerializer(staff).data,
            },
            status=201,
        )


class StaffLoginView(APIView):
    permission_classes = []

    @staticmethod
    def post(request, *args, **kwargs):
        serializer = StaffLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        staff = authenticate_staff(
            phone_number=serializer.validated_data["phone_number"],
            password=serializer.validated_data["password"],
            request=request,
        )

        return Response(
            {
                "success": True,
                "message": "Login successful",
                "staff": StaffAccountSerializer(staff).data,
            }
        )


class AddAccountantView(APIView):
    permission_classes = []

    @staticmethod
    def post(request, *args, **kwargs):
        headteacher = get_authenticated_staff(request)

        serializer = AddAccountantSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        accountant, default_password = add_accountant(
            headteacher, serializer.validated_data
        )

        return Response(
            {
                "success": True,
                "message": "Accountant account created",
                "staff": StaffAccountSerializer(accountant).data,
                "default_password": default_password,
            },
            status=201,
        )


class ChangeCredentialsView(APIView):
    permission_classes = []

    @staticmethod
    def post(request, *args, **kwargs):
        staff = get_authenticated_staff(request)

        serializer = ChangeCredentialsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated = change_credentials(
            staff=staff,
            current_password=serializer.validated_data["current_password"],
            new_phone_number=serializer.validated_data.get("new_phone_number"),
            new_password=serializer.validated_data.get("new_password"),
        )

        return Response(
            {
                "success": True,
                "message": "Credentials updated",
                "staff": StaffAccountSerializer(updated).data,
            }
        )
