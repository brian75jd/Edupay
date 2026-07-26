from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from Payments.views import (
    home_view,
    pay_fees_view,
    headteacher_dashboard_view,
    accountant_dashboard_view,
    create_school_view,
    add_accountant_view,
    change_password_view,
)
from Users.views import login_view, signup_view
from Users.api import StaffLoginView, StaffMeView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)


urlpatterns = [
    path('', home_view, name='home'),
    path('school/login/', login_view, name='login'),
    path('signup/', signup_view, name='signup'),
    path('pay-fees/<int:school_id>/', pay_fees_view, name='pay_fees'),
    path('school/create/', create_school_view, name='create_school'),
    path('school/headteacher/', headteacher_dashboard_view, name='headteacher_dashboard'),
    path('school/accountant/', accountant_dashboard_view, name='accountant_dashboard'),
    path('school/add-accountant/', add_accountant_view, name='add_accountant'),
    path('school/change-password/', change_password_view, name='change_password'),
    path('admin/', admin.site.urls),
    path('payment/', include('Payments.urls')),

    path('user/',include('Users.urls')),

    path('api/', include('schools.urls')),
    path('api/auth/login/', StaffLoginView.as_view(), name='staff_login'),
    path('api/auth/me/', StaffMeView.as_view(), name='staff_me'),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
