from django.shortcuts import render


def home_view(request):
    return render(request, 'home.html')


def pay_fees_view(request):
    return render(request, 'pay_fees.html')
