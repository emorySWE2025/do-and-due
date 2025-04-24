import logging
import uuid
from _decimal import Decimal, ROUND_HALF_UP
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
from chore_tracker.models import Group, Event, Cost
from datetime import datetime
import json
from json import JSONDecodeError
from chore_tracker.utils import update_recurring_events, delete_recurrences

User = get_user_model()
logger = logging.getLogger(__name__)


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
        try:
            name = request.data.get('groupName')
            status = request.data.get('groupStatus')
            expiration_raw = request.data.get('groupExpiration')
            expiration = parse_datetime(expiration_raw) if expiration_raw else None
            timezone = request.data.get('groupTimezone')
            creator = request.data.get('groupCreatorId')
            user = User.objects.get(id=creator)
            logging.info(f"group creator: {creator}")

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
            logger.error(e)
            return JsonResponse({'error': 'Failed to create group'}, status=500)


class ViewGroup(APIView):
    """ View a Group """

    def get(self, request):
        group_id = request.query_params.get('group_id')

        try:
            group = Group.objects.get(id=group_id)
            update_recurring_events(group)
            members = group.members.all()

            return JsonResponse({
                'group': {
                    'id': group.id,
                    'name': group.name,
                    'status': group.status,
                    'expiration': group.expiration,
                    'timezone': group.timezone,
                    'creator': group.creator.username,
                    'members': [member.username for member in members],
                }
            }, status=200)
        except Group.DoesNotExist:
            logger.error("Group not found")
            return JsonResponse({'error': 'Group not found'}, status=404)
        except Exception as e:
            logger.error(e)
            return JsonResponse({'error': 'Failed to view group: ' + str(e)}, status=500)


class AddUsertoGroup(APIView):
    """ Add User to a Group """

    def post(self, request):
        group_id = request.data.get('groupId')
        username = request.data.get('username')

        try:
            group = Group.objects.get(id=group_id)
            user = User.objects.get(username=username)

            # Check if user is already in the group
            if group.members.filter(id=user.id).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'User is already a member of the group'
                }, status=409)

            group.members.add(user)
            return JsonResponse({
                'success': True,
                'message': 'User added to group successfully'
            }, status=201)

        except Group.DoesNotExist:
            logger.error("Group not found")
            return JsonResponse({
                'success': False,
                'message': 'Group not found'
            }, status=404)
        except User.DoesNotExist:
            logger.error("User not found")
            return JsonResponse({
                'success': False,
                'message': 'User not found'
            }, status=404)
        except Exception as e:
            logger.error(e)
            return JsonResponse({
                'success': False,
                'message': 'Failed to add user to group: ' + str(e)
            }, status=500)


class CreateEvent(APIView):
    """ Create an Event """

    def post(self, request):

        try:
            data = json.loads(request.body)

            # We have to check if the group exists before trying to create the event
            try:
                group = Group.objects.get(id=data.get("groupId"))
            except Group.DoesNotExist:
                logger.error("Group not found")
                return JsonResponse(
                    {"success": False, "message": "No such Group"}, status=400
                )

            event = Event.objects.create(
                # ID should be created automatically
                name=data.get("name"),
                # Need to determine date format
                first_date=datetime.strptime(
                    data.get("date"), "%Y-%m-%d"
                ).date(),
                repeat_every=data.get("repeatEvery") if "repeatEvery" in data else None,
                group=group,
            )

            # Get assigned members and add them. This is required due to the ManyToManyField
            group_members = group.members.all()
            member_names = data.get("memberNames", [])
            logger.info(f"{group} members: {member_names}")

            
            for username in member_names:
                if username == '' and len(member_names) == 1:
                    event.members.set(group_members)
                    break
                try:
                    user = User.objects.get(username=username)

                    if user in group_members:
                        event.members.add(user)
                    else:
                        logger.error(f"User {username} not in group {group}")
                        return JsonResponse(
                            {"success": False, "message": f"User {username} not in group"}, status=400
                        )

                except User.DoesNotExist:
                    logger.error(f"User {username} not found")
                    return JsonResponse(
                        {"success": False, "message": f"User {username} not found"}, status=400
                    )

            # Add other occurrence of the Event 
            update_recurring_events(group)

            return JsonResponse({"success": True, "message": ""}, status=200)

        except JSONDecodeError:
            logger.error("error decoding json")
            return JsonResponse(
                {"success": False, "message": "Invalid JSON in request"}, status=400
            )


class UpdateEvent(APIView):
    """ Update an event's details """

    def put(self, request, event_id):
        try:
            data = json.loads(request.body)

            if not event_id:
                logger.error("Event id not found")
                return JsonResponse(
                    {"success": False, "message": "Missing event ID"}, status=400
                )

            try:
                event = Event.objects.get(id=event_id)
            except Event.DoesNotExist:
                logger.error("Event not found")
                return JsonResponse(
                    {"success": False, "message": "Event not found"}, status=404
                )

            # Update fields
            if "name" in data:
                event.name = data["name"]
            if "first_date" in data:
                event.first_date = data["first_date"]
            if "repeat_every" in data:
                event.repeat_every = data["repeat_every"]
            if "is_complete" in data:
                event.is_complete = data["is_complete"]

            event.save()
            logger.info("Event updated")
            return JsonResponse({"success": True, "message": "Event updated"}, status=200)

        except JSONDecodeError:
            logger.error("error decoding json")
            return JsonResponse(
                {"success": False, "message": "Invalid JSON"}, status=400
            )


class DeleteEvent(APIView):
    """ Delete an event """

    def delete(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            delete_recurrences(event)
            event.delete()
            logger.info("Event deleted")
            return JsonResponse({"success": True, "message": "Event deleted"}, status=200)
        except Event.DoesNotExist:
            logger.error("Event not found")
            return JsonResponse(
                {"success": False, "message": "Event not found"}, status=404
            )


class ViewEvent(APIView):
    """ View a single event's details """

    def get(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)

            # Serialize the event details
            data = {
                "id": event.id,
                "name": event.name,
                "first_date": str(event.first_date),
                "repeat_every": event.repeat_every,
                "is_complete": event.is_complete,
                "group": {
                    "id": event.group.id,
                    "name": event.group.name,
                },
                "members": [user.username for user in event.members.all()],
            }

            logger.info("event fetched")
            return JsonResponse({"success": True, "event": data}, status=200)

        except Event.DoesNotExist:
            logger.error("Event not found")
            return JsonResponse(
                {"success": False, "message": "Event not found"}, status=404
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
                logger.error("Group not found")
                return JsonResponse(
                    {"success": False, "message": "No such Group"}, status=400
                )

            # Check if the event exists
            try:
                event = Event.objects.get(name=data.get("name"), group=group)
            except Event.DoesNotExist:
                logger.error("Event not found")
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
                        logger.error(f"User {username} not in group {group}")
                        return JsonResponse(
                            {"success": False, "message": f"User {username} not in group"}, status=400
                        )

                except User.DoesNotExist:
                    logger.error(f"User {username} not found")
                    return JsonResponse(
                        {"success": False, "message": f"User {username} not found"}, status=400
                    )

            event.members.set(memberNames)
            logger.info(f"{group} members: {memberNames}")
            return JsonResponse({"success": True, "message": ""}, status=200)

        except JSONDecodeError:
            logger.error("error decoding json")
            return JsonResponse(
                {"success": False, "message": "Invalid JSON in request"}, status=400
            )


class CurrentUserView(APIView):
    """ Fetches User Info for Auth """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_authenticated:
            user = request.user
            groups = Group.objects.filter(members__in=[user]).prefetch_related('events')

            group_data = []
            for group in groups:
                events = group.events.all().prefetch_related('members')  # type: ignore

                event_data = []
                for event in events:
                    event_data.append({
                        'id': event.id,
                        'name': event.name,
                        'members': list(event.members.all().values('username')),
                        'first_date': event.first_date,
                        'repeat_every': event.repeat_every,
                        'is_complete': event.is_complete,
                    })

                group_data.append({
                    'id': group.id,
                    'name': group.name,
                    'members': list(group.members.all().values('username', 'photo_url')),
                    'events': event_data
                })

            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'groups': group_data
            })


class GetUsers(APIView):
    # get all users that match a particular string 
    def get(self, request):
        try:
            query = request.GET.get('search', '')
            users = User.objects.filter(username__icontains=query).values('id', 'username')
            logger.info(f"users found: {users}")
            return JsonResponse({"success": True, 'users': list(users)}, status=200, )

        except Exception as e:
            logger.error(e)
            return JsonResponse({"success": False, 'error': str(e)}, status=400)


class MarkEventComplete(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body)

            # Check that the event exists
            try:
                event = Event.objects.get(id=data.get("eventId"))
                # which occurrence?

            except Event.DoesNotExist:
                logger.error("Event not found")
                return JsonResponse(
                    {"success": False, "message": "No such Event"}, status=400
                )

            # Toggle event completion status
            if event.is_complete:
                event.is_complete = False
            else:
                event.is_complete = True
            event.save()

            logger.info(f"{event} is updated")
            return JsonResponse({"success": True, "message": "event status updated", "eventStatus": event.is_complete},
                                status=200)

        except JSONDecodeError:
            logger.error("error decoding json")
            return JsonResponse(
                {"success": False, "message": "Invalid JSON in request", "eventStatus": event.is_complete}, status=400
            )


class UserExists(APIView):
    """ Check if a User exists using username """

    def get(self, request):
        username = request.query_params.get('username')

        try:
            user = User.objects.values('id', 'username').get(username=username)
            logger.info(f"{user} exists")
            return JsonResponse({
                'exists': True,
                'user': user
            }, status=200)
        except User.DoesNotExist:
            logger.error("User not found")
            return JsonResponse({
                'exists': False,
                'message': 'User not found'
            }, status=404)


class CreateCost(APIView):
    """ Create a Cost entry """

    def post(self, request):
        group_id = request.data.get('group_id')
        name = request.data.get('name')
        category = request.data.get('category')
        date = request.data.get('date')
        time = request.data.get('time')
        amount = request.data.get('amount')
        payer = request.data.get('payer')
        borrowers = request.data.get('borrower', [])

        # Validate required fields
        if not group_id:
            return JsonResponse({'error': 'No group id provided'}, status=400)
        if not amount:
            return JsonResponse({'error': 'No amount provided'}, status=400)
        if not borrowers:
            return JsonResponse({'error': 'No borrowers provided'}, status=400)
        if not payer:
            return JsonResponse({'error': 'No payer provided'}, status=400)

        try:
            group = Group.objects.get(id=group_id)
            payer_user = User.objects.get(id=payer)
            group_members = set(group.members.all())

            # Check if payer is a member of the group
            if payer_user not in group_members:
                return JsonResponse({'error': 'Payer is not a member of the group'}, status=400)

            # Generate a UUID for the transaction
            transaction_id = uuid.uuid4()

            for borrower in borrowers:
                borrower_user = User.objects.get(id=borrower)
                if borrower_user not in group_members:
                    return JsonResponse({'error': f'User {borrower_user.username} is not a member of the group'},
                                        status=400)

                Cost.objects.create(
                    name=name,
                    category=category,
                    date=date,
                    time=time,
                    amount=(Decimal(amount) / Decimal(len(borrowers))).quantize(Decimal('0.01'),
                                                                                rounding=ROUND_HALF_UP),
                    group=group,
                    payer=payer_user,
                    borrower=borrower_user,
                    transaction_id=transaction_id
                )

            return JsonResponse({'message': 'Cost created successfully'}, status=201)
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            return JsonResponse({'error': 'Failed to create cost: ' + str(e)}, status=500)


class UpdateUsername(APIView):
    permission_classes = [IsAuthenticated]

    """" Update a username """

    def post(self, request):
        if request.user.is_authenticated:
            new_username = request.data.get('username')
            logger.info(f"New username: {new_username}")
            logger.info(f"Current username: {request.user.username}")
            if new_username == request.user.username:
                logger.error("Cannot update with your current username")
                return JsonResponse({'error': f"Cannot update with your current username"}, status=400)

            if User.objects.filter(username=new_username).exists():
                logger.error("Username already exists")
                return JsonResponse({'error': 'Username already exists'}, status=400)

            user = request.user
            user.username = new_username
            user.save()
            logger.info(f"{user.username} is successfully updated to {new_username}")
            return JsonResponse({'message': 'Username updated successfully'}, status=200)

        logger.error("There was an error updating the username")
        return JsonResponse({'error': 'There was an error updating the username'}, status=500)


class LeaveGroup(APIView):
    """ Allows users to leave a group """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_user = request.user.username
        group_id = request.data.get('groupId')

        try:
            group = Group.objects.get(id=group_id)
            user = User.objects.get(username=current_user)
            if user == group.creator:
                return JsonResponse({'success': False,
                                     'message': f'Creators are not allowed to leave this group'}, status=403)
            group.members.remove(user)
            logger.info(f"{user.username} has left the {group} group")
            return JsonResponse({
                'success': True,
                'message': 'User removed from group successfully'
            }, status=200)

        except Exception as e:
            logger.error(e)
            return JsonResponse({
                'success': False,
                'message': 'Failed to remove user from group: ' + str(e)
            }, status=500)
