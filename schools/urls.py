from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import PaymentMethodViewSet, SchoolViewSet,SchoolView



app_name = "schools"

urlpatterns =[
    path('school_all/',SchoolView.as_view(),name='school_all')
]
