from Users.serializers import ParentCreationSerializer, Response200Serializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from drf_spectacular.utils import (
    extend_schema
)
from Payments.serializers import View404ResponseSerializer
from Users.utils import ParentCreationView,authenticate

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