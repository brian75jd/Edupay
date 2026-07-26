from Users import api
from django.urls import path


urlpatterns = [
    path('v1/create_user_account/',view=api.UserCreationView.as_view(),name='create_user'),
    path('v1/user_login/',api.UserLogginView.as_view()),
    path('v1/histories/',api.UserHistory.as_view())
]
