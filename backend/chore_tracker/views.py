from django.contrib.auth.models import User
from django.contrib.auth import login
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from chore_tracker.models import Group, Event
import datetime
import json
from json import JSONDecodeError


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


class ViewGroup(APIView):
    """ View a Group """

    def get(self, request):
        group_id = request.query_params.get('group_id')

        try:
            group = Group.objects.get(id=group_id)
            members = group.members.all()
            events = group.events.all()
            costs = group.costs.all()

            return JsonResponse({
                'group': {
                    'id': group.id,
                    'name': group.name,
                    'status': group.status,
                    'expiration': group.expiration,
                    'timezone': group.timezone,
                    'creator': group.creator.username,
                    'members': [member.username for member in members],
                    'events': [{'id': event.id, 'name': event.name} for event in events],
                    'costs': [{'id': cost.id, 'name': cost.name, 'amount': cost.amount} for cost in costs],
                }
            }, status=200)
        except Group.DoesNotExist:
            return JsonResponse({'error': 'Group not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': 'Failed to view group: ' + str(e)}, status=500)


class AddUsersToGroup(APIView):
    """ Add Users to a Group """

    def post(self, request):
        group_id = request.data.get('group_id')
        usernames = request.data.get('usernames', [])

        if not usernames:
            return JsonResponse({'error': 'No usernames provided'}, status=400)

        try:
            group = Group.objects.get(id=group_id)

            # Track status for each username
            result = {
                'success': [],
                'not_found': []
            }

            # Get existing members usernames for efficient lookup
            existing_members = set(group.members.values_list('username', flat=True))

            # Process each username individually
            for username in usernames:
                try:
                    user = User.objects.get(username=username)
                    if username in existing_members:
                        continue  # Skip if user is already a member
                    else:
                        group.members.add(user)
                        result['success'].append(username)
                except User.DoesNotExist:
                    result['not_found'].append(username)

            return JsonResponse({
                'message': 'Operation completed',
                'results': result
            }, status=200 if result['success'] else 404)

        except Group.DoesNotExist:
            return JsonResponse({'error': 'Group not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': f'Failed to invite users: {str(e)}'}, status=500)
        
        
class CreateEvent(APIView):

    def post(self, request):

        if request.method == "POST":
            try:
                data = json.loads(request.body)

                # We have to check if the group exists before trying to create the event
                try:
                    group = Group.objects.get(id=data.get("groupId"))
                except Group.DoesNotExist:
                    return JsonResponse(
                        {"success": False, "message": "No such Group"}, status=400
                    )

                event = Event.objects.create(
                    # ID should be created automatically
                    name=data.get("name"),
                    # Need to determine date format
                    first_date=datetime.strptime(
                        data.get("date"), "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    first_time=datetime.strptime(
                        data.get("date"), "%Y-%m-%d %H:%M:%S"
                    ).time(),
                    # TODO: Add this in, for now its not in interface in schema.ts
                    repeat_every="",
                    group=group,
                )

                # Get assigned members and add them. This is required due to the ManyToManyField
                members = User.objects.filter(id__in=data.get("memberIds", []))
                event.members.set(members)

                return JsonResponse({"success": True, "message": ""}, status=200)

            except JSONDecodeError:
                return JsonResponse(
                    {"success": False, "message": "Invalid JSON in request"}, status=400
                )

        return JsonResponse(
            {"success": False, "message": "Expected POST method"}, status=405
        )