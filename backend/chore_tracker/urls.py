from django.urls import path
from .views import RegisterUser, LoginView, CreateGroup, IndexView, InviteUserToGroup

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('group/create/', CreateGroup.as_view(), name='create_group'),
    path('group/invite/', InviteUserToGroup.as_view(), name='invite_group'),
]
