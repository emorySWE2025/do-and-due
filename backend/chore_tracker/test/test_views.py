from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import Client
from django.utils import timezone
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

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
