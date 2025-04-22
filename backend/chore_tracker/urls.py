from django.urls import path
from .views import (AddUsertoGroup, GetUsers, RegisterUser, LoginView, CreateGroup, IndexView, AddUsersToGroup, ViewGroup,
                    CreateEvent, UpdateEvent, DeleteEvent, ViewEvent, CurrentUserView, ChangeEventMembers, 
                    MarkEventComplete, UserExists, CreateCost)

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('get-current-user/', CurrentUserView.as_view(), name='get-current-user'),
    path('group/create/', CreateGroup.as_view(), name='create_group'),
    path('group/add_users/', AddUsersToGroup.as_view(), name='add_group'),
    path('group/view/', ViewGroup.as_view(), name='view_group'),
    path('event/create/', CreateEvent.as_view(), name='create_event'),
    path('event/update/<int:event_id>/', UpdateEvent.as_view(), name='update_event'),
    path('event/delete/<int:event_id>/', DeleteEvent.as_view(), name='delete_event'),
    path('event/view/<int:event_id>/', ViewEvent.as_view(), name='view-event'),
    path('event/change_members/', ChangeEventMembers.as_view(), name='change_event_members'),
    path('event/complete/', MarkEventComplete.as_view(), name='mark_event_complete'),
    path('get-users/', GetUsers.as_view(), name='get-users'),
    path('group/add_user/', AddUsertoGroup.as_view(), name='add_user'),
    path('user/exists/', UserExists.as_view(), name='user_exists'),
    path('cost/create/', CreateCost.as_view(), name='create_cost'),

]
