from django.shortcuts import render


def home_view(request):
    return render(request, 'home.html')


def pay_fees_view(request):
    return render(request, 'pay_fees.html')


def headteacher_dashboard_view(request):
    return render(request, 'school/headteacher_dashboard.html')


def accountant_dashboard_view(request):
    return render(request, 'school/accountant_dashboard.html')


def create_school_view(request):
    return render(request, 'school/create.html')


def add_accountant_view(request):
    return render(request, 'school/add_accountant.html')


def change_password_view(request):
    return render(request, 'school/change_password.html')
