from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.views import APIView


def home_view(request):
    return render(request, 'home.html')


class InitiatePayment(APIView):
    authentication_classes = []

    @staticmethod
    def post(request, *args, **kwargs):
        pass