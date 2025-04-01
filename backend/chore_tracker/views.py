from django.contrib.auth.models import User
from django.contrib.auth import login
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from chore_tracker.models import Group


class IndexView(APIView):
    """ Index View """

    def get(self, request):
        return JsonResponse({'message': 'Welcome to Chore Tracker'})


class RegisterUser(APIView):
    """ User Registration """

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already in use'}, status=400)

        try:
            User.objects.create_user(username=username, email=email, password=password)
        except ValidationError as e:
            return Response({'error': str(e)}, status=400)

        return Response({'message': 'User registered successfully'}, status=201)


class LoginView(APIView):
    """ User Login with JWT in Cookies """
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # case-insensitive username check
        user = User.objects.filter(username__iexact=username).first()

        if user and user.check_password(password):

            login(request, user)
            refresh = RefreshToken.for_user(user)
            response = Response({
                'message': 'Login successful',
            })

            response.set_cookie(
                key='access_token',
                value=str(refresh.access_token),
                httponly=True,
                secure=False,
                samesite='Lax'
            )
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=False,
                samesite='Lax'
            )

            return response
        else:
            return Response({'error': 'Invalid credentials'}, status=401)


class CreateGroup(APIView):
    """ Create a Group """

    def post(self, request):
        name = request.data.get('name')
        status = request.data.get('status')
        expiration = request.data.get('expiration')
        timezone = request.data.get('timezone')
        creator = request.user

        try:
            group = Group.objects.create(
                name=name,
                status=status,
                expiration=expiration,
                timezone=timezone,
                creator=creator
            )

            group.members.add(creator)

            return JsonResponse({'message': 'Group created successfully'}, status=201)
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            return JsonResponse({'error': 'Failed to create group: ' + str(e)}, status=500)


class InviteUserToGroup(APIView):
    """ Invite a User to a Group """

    def post(self, request):
        group_id = request.data.get('group_id')
        username = request.data.get('username')

        try:
            group = Group.objects.get(id=group_id)
            user = User.objects.get(username=username)

            if user in group.members.all():
                return JsonResponse({'error': 'User is already a member of the group'}, status=400)

            group.members.add(user)

            return JsonResponse({'message': 'User invited successfully'}, status=200)
        except Group.DoesNotExist:
            return JsonResponse({'error': 'Group not found'}, status=404)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': 'Failed to invite user: ' + str(e)}, status=500)
