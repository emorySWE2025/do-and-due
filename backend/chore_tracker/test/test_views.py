import json
from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import Client
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from chore_tracker.models import Group, Event, Cost

User = get_user_model()


@pytest.mark.django_db
def test_index_view(client):
    url = reverse('index')
    response = client.get(url)
    assert response.status_code == 200
    assert response.json() == {'message': 'Welcome to Chore Tracker'}


@pytest.mark.django_db
def test_register_user_success(client):
    url = reverse('register')

    data = {
        'username': 'testusername',
        'email': 'test@email.com',
        'password': 'test',
    }

    response = client.post(url, data, content_type='application/json')
    assert response.status_code == status.HTTP_201_CREATED

    assert response.json() == {'message': 'User registered successfully'}
    assert User.objects.filter(username="testusername").exists()


@pytest.mark.django_db
def test_register_username_exists(client):
    url = reverse('register')

    User.objects.create_user(username='testusername', email='test@example.com', password='password123')

    data = {
        'username': 'testusername',
        'email': 'test@email.com',
        'password': 'test',
    }

    response = client.post(url, data, content_type='application/json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    assert response.json() == {'error': 'Username already exists'}


@pytest.mark.django_db
def test_register_email_exists(client):
    url = reverse('register')

    User.objects.create_user(username='test_username', email='test@email.com', password='password123')

    data = {
        'username': 'testusername',
        'email': 'test@email.com',
        'password': 'test',
    }

    response = client.post(url, data, content_type='application/json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    assert response.json() == {'error': 'Email already in use'}


@pytest.mark.django_db
@patch('chore_tracker.views.User.objects.create_user')
def test_register_user_create_exception(mock_create_user):
    client = Client()

    mock_create_user.side_effect = Exception("Something went wrong")

    response = client.post(
        reverse('register'),
        data={
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'securepassword'
        },
        content_type='application/json'
    )

    assert response.status_code == 400
    assert 'error' in response.json()
    assert response.json()['error'] == 'Something went wrong'


@pytest.mark.django_db
def test_login_user_success(client):
    url = reverse('login')
    User.objects.create_user(username='test_username', password='test_password', email='test@example.com')

    response = client.post(url, {'username': 'test_username', 'password': 'test_password'})
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_login_error(client):
    url = reverse('login')
    User.objects.create_user(username='test_username', password='testpassword', email='test@example.com')
    response = client.post(url, {'username': 'test_username', 'password': 'test_password'})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_current_user_view_success(client):
    user = User.objects.create_user(username='test_username', password='testpassword', email='test@example.com')

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    url = reverse('get-current-user')

    response = client.get(url, HTTP_AUTHORIZATION=f'Bearer {access_token}')

    data = response.json()
    assert 'id' in data
    assert 'username' in data
    assert 'email' in data
    assert 'groups' in data
    assert data['username'] == user.username
    assert data['id'] == user.id


@pytest.mark.django_db
def test_create_group_exception(client):
    user = User.objects.create_user(username="creator", password="pass", email="test@example.com")
    client.force_login(user)

    data = {
        'groupName': 'Test Group',
        'groupStatus': 'active',
        'groupExpiration': timezone.now().isoformat(),
        'groupTimezone': 'UTC',
        'groupCreatorId': 999
    }
    response = client.post(reverse('create_group'), data)
    assert response.status_code == 500


@pytest.mark.django_db
def test_view_group_success(client):
    user = User.objects.create_user(username="testuser", email="test@example.com", password="pass")
    group = Group.objects.create(
        name="Test Group",
        status="active",
        expiration=timezone.now(),
        timezone="UTC",
        creator=user,
    )
    group.members.add(user)

    client.force_login(user)
    response = client.get(reverse('view_group'), {'group_id': group.id})
    data = response.json()

    assert response.status_code == 200
    assert data['group']['id'] == group.id
    assert data['group']['name'] == "Test Group"
    assert data['group']['creator'] == "testuser"


@pytest.mark.django_db
def test_view_group_not_found(client):
    user = User.objects.create_user(username="testuser", email="test@example.com", password="pass")
    client.force_login(user)

    response = client.get(reverse('view_group'), {'group_id': 9999})
    assert response.status_code == 404
    assert response.json()['error'] == 'Group not found'


@pytest.mark.django_db
def test_create_event_success(client):
    creator = User.objects.create_user(username="creator", email="creator@test.com", password="pass")
    user1 = User.objects.create_user(username="user1", email="user1@test.com", password="pass")
    group = Group.objects.create(
        name="Test Group",
        status="active",
        expiration=timezone.now() + timedelta(days=1),
        timezone="UTC",
        creator=creator
    )
    group.members.set([creator, user1])
    client.force_login(creator)

    payload = {
        "groupId": group.id,
        "name": "Test Event",
        "date": "2025-01-01",
        "repeatEvery": "weekly",
        "memberNames": ["creator", "user1"]
    }

    response = client.post(
        reverse("create_event"),
        data=json.dumps(payload),
        content_type="application/json"
    )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert Event.objects.filter(name="Test Event").exists()


@pytest.mark.django_db
def test_create_event_group_not_found(client):
    user = User.objects.create_user(username="user", email="user@test.com", password="pass")
    client.force_login(user)

    payload = {
        "groupId": 9999,
        "name": "Event",
        "date": "2025-01-01",
        "memberNames": []
    }

    response = client.post(reverse("create_event"), data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    assert response.json()["message"] == "No such Group"


@pytest.mark.django_db
def test_update_event_success(client):
    user = User.objects.create_user(username="user", email="user@test.com", password="pass")
    group = Group.objects.create(name="Test Group", status="active", expiration=timezone.now(), timezone="UTC",
                                 creator=user)
    event = Event.objects.create(name="Old Event", first_date="2025-01-01", group=group)
    client.force_login(user)

    payload = {
        "name": "Updated Event",
        "first_date": "2025-02-01",
        "repeat_every": "monthly",
        "is_complete": True
    }

    response = client.put(
        reverse("update_event", args=[event.id]),
        data=json.dumps(payload),
        content_type="application/json"
    )

    assert response.status_code == 200
    assert response.json()["success"] is True
    event.refresh_from_db()
    assert event.name == "Updated Event"
    assert event.first_date.isoformat() == "2025-02-01"
    assert event.repeat_every == "monthly"
    assert event.is_complete is True


@pytest.mark.django_db
def test_update_event_not_found(client):
    user = User.objects.create_user(username="user", email="user@test.com", password="pass")
    client.force_login(user)

    payload = {"name": "Update Attempt"}

    response = client.put(
        reverse("update_event", args=[999]),  # Non-existent event
        data=json.dumps(payload),
        content_type="application/json"
    )

    assert response.status_code == 404

    assert "Event not found" in response.json()["message"]


@pytest.mark.django_db
def test_update_event_invalid_json(client):
    user = User.objects.create_user(username="user", email="user@test.com", password="pass")
    event = Event.objects.create(name="Test Event", first_date="2025-01-01",
                                 group=Group.objects.create(name="g", status="active", expiration=timezone.now(),
                                                            timezone="UTC", creator=user))
    client.force_login(user)

    response = client.put(
        reverse("update_event", args=[event.id]),
        data="{invalidjson",
        content_type="application/json"
    )

    assert response.status_code == 400
    assert response.json()["message"] == "Invalid JSON"


@pytest.mark.django_db
def test_delete_event_success(client):
    user = User.objects.create_user(username="user", password="pass", email="user@test.com")
    group = Group.objects.create(name="Test Group", status="active", expiration=timezone.now(), timezone="UTC",
                                 creator=user)
    event = Event.objects.create(name="Test Event", first_date="2025-01-01", group=group)

    client.force_login(user)

    response = client.delete(reverse('delete_event', args=[event.id]))

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["message"] == "Event deleted"
    assert Event.objects.count() == 0


@pytest.mark.django_db
def test_delete_event_not_found(client):
    user = User.objects.create_user(username="user", password="pass", email="user@test.com")
    client.force_login(user)

    response = client.delete(reverse('delete_event', args=[999]))

    assert response.status_code == 404
    assert response.json()["success"] is False
    assert response.json()["message"] == "Event not found"


@pytest.mark.django_db
def test_view_event_success(client):
    user = User.objects.create_user(username="testuser", password="pass", email="user@test.com")
    group = Group.objects.create(name="Test Group", status="active", expiration=timezone.now(), timezone="UTC",
                                 creator=user)
    event = Event.objects.create(name="Event 1", first_date="2025-01-01", repeat_every="weekly", is_complete=False,
                                 group=group)
    event.members.add(user)

    client.force_login(user)

    response = client.get(reverse('view-event', args=[event.id]))
    data = response.json()

    assert response.status_code == 200
    assert data["success"] is True
    assert data["event"]["id"] == event.id
    assert data["event"]["name"] == "Event 1"
    assert data["event"]["repeat_every"] == "weekly"
    assert data["event"]["group"]["id"] == group.id
    assert data["event"]["members"] == ["testuser"]


@pytest.mark.django_db
def test_view_event_not_found(client):
    user = User.objects.create_user(username="testuser", password="pass", email="user@test.com")
    client.force_login(user)

    response = client.get(reverse('view-event', args=[999]))
    data = response.json()

    assert response.status_code == 404
    assert data["success"] is False
    assert data["message"] == "Event not found"


@pytest.mark.django_db
def test_mark_event_complete(client):
    creator = User.objects.create_user(username="creator", password="pass", email="creator@test.com")

    group = Group.objects.create(name="Test Group", status="active", expiration=timezone.now(), timezone="UTC",
                                 creator=creator)
    group.members.add(creator)

    event = Event.objects.create(name="Test Event", first_date="2025-01-01", group=group, is_complete=False)

    client.force_login(creator)

    payload = {
        "eventId": event.id
    }

    response = client.post(reverse('mark_event_complete'), data=json.dumps(payload), content_type="application/json")

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["message"] == "event status updated"
    assert response.json()["eventStatus"] is True

    event.refresh_from_db()
    assert event.is_complete is True

    response = client.post(reverse('mark_event_complete'), data=json.dumps(payload), content_type="application/json")

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["message"] == "event status updated"
    assert response.json()["eventStatus"] is False

    event.refresh_from_db()
    assert event.is_complete is False


@pytest.mark.django_db
def test_user_exists(client):
    User.objects.create_user(username="testuser", password="password", email="testuser@test.com")

    response = client.get(reverse('user_exists'), {'username': 'testuser'})

    assert response.status_code == 200
    response_data = response.json()
    assert response_data["exists"] is True
    assert response_data["user"]["username"] == "testuser"
    assert "id" in response_data["user"]

    response = client.get(reverse('user_exists'), {'username': 'nonexistentuser'})

    assert response.status_code == 404
    response_data = response.json()
    assert response_data["exists"] is False
    assert response_data["message"] == "User not found"


@pytest.mark.django_db
def test_create_cost_missing_group_id(client):
    user = User.objects.create_user(username="user", password="password", email="user@test.com")

    cost_data = {
        'name': 'Test Cost',
        'category': 'Food',
        'date': timezone.now().date().isoformat(),
        'time': timezone.now().time().isoformat(),
        'amount': '50.00',
        'payer': user.id,
        'borrower': [user.id]
    }

    client.force_login(user)
    response = client.post(reverse('create_cost'), data=cost_data, content_type="application/json")

    assert response.status_code == 400
    assert response.json()['error'] == 'No group id provided'


@pytest.mark.django_db
def test_create_cost_missing_amount(client):
    user = User.objects.create_user(username="user", password="password", email="user@test.com")
    group = Group.objects.create(name="Test Group", status="active", expiration=timezone.now(), timezone="UTC",
                                 creator=user)
    group.members.add(user)

    cost_data = {
        'group_id': group.id,
        'name': 'Test Cost',
        'category': 'Food',
        'date': timezone.now().date().isoformat(),
        'time': timezone.now().time().isoformat(),
        'payer': user.id,
        'borrower': [user.id]
    }

    client.force_login(user)
    response = client.post(reverse('create_cost'), data=cost_data, content_type="application/json")

    assert response.status_code == 400
    assert response.json()['error'] == 'No amount provided'


@pytest.mark.django_db
def test_create_cost_payer_not_in_group(client):
    user1 = User.objects.create_user(username="user1", password="password", email="user1@test.com")
    user2 = User.objects.create_user(username="user2", password="password", email="user2@test.com")

    group = Group.objects.create(name="Test Group", status="active", expiration=timezone.now(), timezone="UTC",
                                 creator=user1)
    group.members.add(user2)

    cost_data = {
        'group_id': group.id,
        'name': 'Test Cost',
        'category': 'Food',
        'date': timezone.now().date().isoformat(),
        'time': timezone.now().time().isoformat(),
        'amount': '100.00',
        'payer': user1.id,
        'borrower': [user2.id]
    }

    client.force_login(user2)
    response = client.post(reverse('create_cost'), data=cost_data, content_type="application/json")

    assert response.status_code == 400
    assert response.json()['error'] == 'Payer is not a member of the group'


@pytest.mark.django_db
def test_create_cost_borrower_not_in_group(client):
    user1 = User.objects.create_user(username="user1", password="password", email="user1@test.com")
    user2 = User.objects.create_user(username="user2", password="password", email="user2@test.com")
    user3 = User.objects.create_user(username="user3", password="password", email="user3@test.com")

    group = Group.objects.create(name="Test Group", status="active", expiration=timezone.now(), timezone="UTC",
                                 creator=user1)
    group.members.add(user1, user2)

    cost_data = {
        'group_id': group.id,
        'name': 'Test Cost',
        'category': 'Food',
        'date': timezone.now().date().isoformat(),
        'time': timezone.now().time().isoformat(),
        'amount': '100.00',
        'payer': user1.id,
        'borrower': [user3.id]
    }

    client.force_login(user1)
    response = client.post(reverse('create_cost'), data=cost_data, content_type="application/json")

    assert response.status_code == 400
    assert response.json()['error'] == 'User user3 is not a member of the group'


@pytest.mark.django_db
def test_update_username_success():
    user = User.objects.create_user(username='olduser', email="test@example.com", password='password123')
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        reverse('update_username'),
        {'username': 'newuser'},
        format='json'
    )

    assert response.status_code == 200
    assert response.json()['message'] == 'Username updated successfully'
    user.refresh_from_db()
    assert user.username == 'newuser'

@pytest.mark.django_db
def test_leave_group_success():
    creator = User.objects.create_user(username='creator', email="test@email.com", password='pass')
    member = User.objects.create_user(username='member', email="user@email.com", password='pass')

    group = Group.objects.create(name='Group', status='active', creator=creator)
    group.members.add(creator, member)

    client = APIClient()
    client.force_authenticate(user=member)

    response = client.post(
        reverse('leave_group'),
        {'groupId': group.id},
        format='json'
    )

    assert response.status_code == 200
    assert response.json()['message'] == 'User removed from group successfully'
    group.refresh_from_db()
    assert member not in group.members.all()

