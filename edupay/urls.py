from django.contrib import admin
from django.urls import path, include
from Payments.views import home_view, pay_fees_view
from Users.views import login_view, signup_view
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)


urlpatterns = [
    path('', home_view, name='home'),
    path('login/', login_view, name='login'),
    path('signup/', signup_view, name='signup'),
    path('pay-fees/', pay_fees_view, name='pay_fees'),
    path('admin/', admin.site.urls),
    path('api/payment/', include('Payments.urls')),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
