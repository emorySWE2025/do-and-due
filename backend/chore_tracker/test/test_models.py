from django.test import TestCase
from chore_tracker.models import User, Group, Event, Cost, RecurringCost
from django.utils import timezone
from freezegun import freeze_time


@freeze_time("2023-01-01 12:34:56")
class ModelTestCase(TestCase):
    def setUp(self):
        self.user1 = User.objects.create(
            name="Alice",
            username="alice123",
            password="password123",
            email="alice@example.com",
            photo_url="http://example.com/photo1.jpg"
        )
        self.user2 = User.objects.create(
            name="Bob",
            username="bob123",
            password="password456",
            email="bob@example.com",
            photo_url="http://example.com/photo2.jpg"
        )

        self.group = Group.objects.create(
            name="Test Group",
            status="active",
            timezone="UTC",
            creator=self.user1
        )
        self.group.members.add(self.user1, self.user2)

        self.event = Event.objects.create(
            name="Test Event",
            first_date=timezone.now().date(),
            group=self.group
        )
        self.event.members.add(self.user1, self.user2)

        self.cost = Cost.objects.create(
            name="Test Cost",
            category="Food",
            amount=50.0,
            group=self.group,
            borrower=self.user2,
            payer=self.user1,
            date=timezone.now().date(),
            time=timezone.now().time(),
        )

        self.recurring_cost = RecurringCost.objects.create(
            name="Test Recurring Cost",
            category="Food",
            amount="100.0",
            start_date=timezone.now().date(),
            end_date=timezone.now().date(),
            frequency="daily",
            group=self.group,
            payer=self.user2,
        )

        self.recurring_cost.borrowers.add(self.user1)

    def test_user_creation(self):
        user = User.objects.get(username="alice123")
        self.assertEqual(user.name, "Alice")
        self.assertEqual(user.email, "alice@example.com")
        self.assertEqual(user.photo_url, "http://example.com/photo1.jpg")

    def test_group_creation(self):
        group = Group.objects.get(name="Test Group")
        self.assertEqual(group.status, "active")
        self.assertEqual(group.creator, self.user1)
        self.assertIn(self.user2, group.members.all())

    def test_event_creation(self):
        event = Event.objects.get(name="Test Event")
        self.assertEqual(event.group, self.group)
        self.assertIn(self.user1, event.members.all())
        self.assertIn(self.user2, event.members.all())

    def test_cost_creation(self):
        cost = Cost.objects.get(name="Test Cost")
        self.assertEqual(cost.amount, 50.0)
        self.assertEqual(cost.category, "Food")
        self.assertEqual(cost.group, self.group)
        self.assertEqual(cost.borrower, self.user2)
        self.assertEqual(cost.payer, self.user1)
        self.assertEqual(cost.date, timezone.now().date())
        self.assertEqual(cost.time, timezone.now().time())

    def test_str_method_user(self):
        self.assertEqual(str(self.user1), "alice123")

    def test_str_method_group(self):
        self.assertEqual(str(self.group), "Test Group")

    def test_str_method_event(self):
        self.assertEqual(str(self.event), "Test Event")

    def test_str_method_cost(self):
        self.assertEqual(str(self.cost), "Test Cost")

    def test_str_method_recurring_cost(self):
        self.assertEqual(str(self.recurring_cost), "Test Recurring Cost (daily)")
