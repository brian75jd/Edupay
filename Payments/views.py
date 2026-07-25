from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.views import APIView


def home_view(request):
    return render(request, 'home.html')


def school_list_view(request):
    return render(request, 'schools/school_list.html')


def payment_history_view(request):
    return render(request, 'history/payment_history.html')


class InitiatePayment(APIView):
    authentication_classes = []

    @staticmethod
    def post(request, *args, **kwargs):
        pass