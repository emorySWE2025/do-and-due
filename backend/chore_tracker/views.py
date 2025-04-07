# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.contrib.auth import login
from django.http import JsonResponse
from django.utils.dateparse import parse_datetime
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from chore_tracker.models import Group, Event, EventOccurrence
import datetime
import json
from json import JSONDecodeError

User = get_user_model()


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
            return JsonResponse({'error': 'Username already exists'}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already in use'}, status=400)

        try:
            User.objects.create_user(username=username, email=email, password=password)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

        return JsonResponse({'message': 'User registered successfully'}, status=201)


@method_decorator(csrf_exempt, name='dispatch')
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
            response = JsonResponse({
                'message': 'Login successful',
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            })

            return response
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)


class CreateGroup(APIView):
    """ Create a Group """

    def post(self, request):


        name = request.data.get('groupName')
        status = request.data.get('groupStatus')
        expiration_raw = request.data.get('groupExpiration')
        expiration = parse_datetime(expiration_raw) if expiration_raw else None
        timezone = request.data.get('groupTimezone')
        creator = request.data.get('groupCreatorId')
        user = User.objects.get(id=creator)
        # creator = request.user
        print(creator)


        try:
            group = Group(
                name=name,
                status=status,
                expiration=expiration,
                timezone=timezone,

            )
            group.creator = user
            group.save()

            group.members.add(user)
            group.save()
            
            return JsonResponse({'message': 'Group created successfully'}, status=201)
        except Exception as e:
            print(e)
            return JsonResponse({'error': 'Failed to create group'}, status=500)
        # except ValidationError as e:
        #     return JsonResponse({'error': str(e)}, status=400)
        # except Exception as e:
        #     return JsonResponse({'error': 'Failed to create group: ' + str(e)}, status=500)


class ViewGroup(APIView):
    """ View a Group """

    def get(self, request):
        group_id = request.query_params.get('group_id')

        try:
            group = Group.objects.get(id=group_id)
            members = group.members.all()
            # events = group.events.all()
            # costs = group.costs.all()

            return JsonResponse({
                'group': {
                    'id': group.id,
                    'name': group.name,
                    'status': group.status,
                    'expiration': group.expiration,
                    'timezone': group.timezone,
                    'creator': group.creator.username,
                    'members': [member.username for member in members],
                    # 'events': [{'id': event.id, 'name': event.name} for event in events],
                    # 'costs': [{'id': cost.id, 'name': cost.name, 'amount': cost.amount} for cost in costs],
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
    """ Create an Event """

    def post(self, request):

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
                repeat_every=data.get("repeatEvery") if "repeatEvery" in data else None,
                group=group,
            )

            # Get assigned members and add them. This is required due to the ManyToManyField
            group_members = group.members.all()
            memberNames = data.get("memberNames", [])

            for username in memberNames:
                try:
                    user = User.objects.get(username=username)

                    if user in group_members:
                        event.members.add(user)
                    else:
                        return JsonResponse(
                            {"success": False, "message": f"User {username} not in group"}, status=400
                        )
                    
                except User.DoesNotExist:
                    return JsonResponse(
                        {"success": False, "message": f"User {username} not found"}, status=400
                    )
                
            # TODO: Add an occurrence of the Event 
            #       For recurring Events, we need to add multiple. 
            #       Maybe we can make a new one when the date/time for previous one has passed?

            return JsonResponse({"success": True, "message": ""}, status=200)

        except JSONDecodeError:
            return JsonResponse(
                {"success": False, "message": "Invalid JSON in request"}, status=400
            )
        

class ChangeEventMembers(APIView):
    """ Change who is assigned to an event """

    def post(self, request):

        try:
            data = json.loads(request.body)

            # Check that the group is valid
            try:
                group = Group.objects.get(id=data.get("groupId"))
            except Group.DoesNotExist:
                return JsonResponse(
                    {"success": False, "message": "No such Group"}, status=400
                )

            # Check if the event exists
            try:
                event = Event.objects.get(name=data.get("name"), group=group)
            except Event.DoesNotExist:
                return JsonResponse(
                    {"success": False, "message": "No such Event"}, status=400
                )

            # Check that members to assign exist and are in the group. Then, assign them
            group_members = group.members.all()
            memberNames = data.get("memberNames", [])
            
            for username in memberNames:
                try:
                    user = User.objects.get(username=username)

                    if not user in group_members:
                        return JsonResponse(
                            {"success": False, "message": f"User {username} not in group"}, status=400
                        )
                    
                except User.DoesNotExist:
                    return JsonResponse(
                        {"success": False, "message": f"User {username} not found"}, status=400
                    )
                
            event.members.set(memberNames)

            return JsonResponse({"success": True, "message": ""}, status=200)

        except JSONDecodeError:
            return JsonResponse(
                {"success": False, "message": "Invalid JSON in request"}, status=400
            )


class CurrentUserView(APIView):
    """ Fetches User Info for Auth """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_authenticated:
            user = request.user
            # groups = user.groups.values('id', 'name')
            groups = Group.objects.filter(members__in=[user]).prefetch_related('events')

            group_data = []
            for group in groups:
                events = group.events.all().values('id', 'name', 'first_date', 'first_time', 'repeat_every') # type: ignore
                group_data.append({
                    'id': group.id,
                    'name': group.name,
                    'members': list(group.members.all().values('username', 'photo_url')),
                    'events': list(events)
                })

            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'groups': group_data
            })
