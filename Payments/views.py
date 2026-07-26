from django.shortcuts import render,redirect
from schools.models import School

def home_view(request):
    return render(request, 'home.html')


def pay_fees_view(request,school_id):

    try:
        school = School.objects.get(id = school_id)
    except School.DoesNotExist:
        return redirect('/')
    return render(request, 'pay_fees.html',{'school':school})


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
