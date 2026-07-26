from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import AccountantView, SchoolView, CreateSchoolView, StudentsView



app_name = "schools"

urlpatterns =[
    path('school_all/',SchoolView.as_view(),name='school_all'),
    path('create_school/',CreateSchoolView.as_view(),name='create_school'),
    path('accountants/', AccountantView.as_view(), name='accountants'),
    path('accountants/<int:pk>/', AccountantView.as_view(), name='accountant_detail'),
    path('students/', StudentsView.as_view(), name='students'),
]
