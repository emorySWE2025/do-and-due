from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import BaseUserManager
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=40)
    username = models.CharField(max_length=40, unique=True)
    password = models.CharField(max_length=162)
    email = models.EmailField(max_length=60)
    photo_url = models.CharField(max_length=60, default="None")

    def __str__(self):
        return self.username

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']


class Group(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=60)
    status = models.CharField(max_length=30)
    expiration = models.DateTimeField(null=True, blank=True)
    timezone = models.CharField(max_length=30)

    # Relationships
    creator = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="owned_groups")
    members = models.ManyToManyField(get_user_model(), related_name="joined_groups")

    def __str__(self):
        return self.name


class Event(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=60)
    first_date = models.DateField()
    time = models.TimeField(null=True, blank=True)
    repeat_every = models.CharField(max_length=40, null=True, blank=True)
    # repeat_every = models.IntegerField(null=True)

    # Relationships
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="events")
    members = models.ManyToManyField(User, related_name="events")
    is_complete = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class EventOccurrence(models.Model):
    id = models.AutoField(primary_key=True)
    date = models.DateField(default=None)
    time = models.TimeField(default=None)

    # Relationships
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="occurrences", default=None)

    def __str__(self):
        return self.event.name


class Cost(models.Model):
    id = models.AutoField(primary_key=True)
    transaction_id = models.UUIDField(null=True, blank=True)  # to group Costs that are part of the same transaction
    name = models.CharField(max_length=60)
    category = models.CharField(max_length=40, null=True, blank=True)
    date = models.DateField()
    time = models.TimeField()
    amount = models.FloatField()
    settled = models.BooleanField(default=False)
    settled_date = models.DateField(null=True, blank=True)
    settled_time = models.TimeField(null=True, blank=True)

    # Relationships
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="costs")
    borrower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="borrower")
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="costs")

    def __str__(self):
        return self.name


class RecurringCost(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # Optional end date
    frequency = models.CharField(
        max_length=20,
        choices=[
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
        ]
    )
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="recurring_costs")
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recurring_costs")
    borrowers = models.ManyToManyField(User, related_name="recurring_cost_borrowers")

    def __str__(self):
        return f"{self.name} ({self.frequency})"

    def generate_costs(self):
        """Generate individual Cost entries based on the recurrence pattern."""
        from datetime import timedelta, date
        import uuid

        interval = {
            'daily': timedelta(days=1),
            'weekly': timedelta(weeks=1),
            'monthly': timedelta(days=30),  # Approximation for simplicity
        }.get(self.frequency)

        if not interval:
            raise ValueError("Invalid frequency")

        current_date = self.start_date
        while current_date <= (self.end_date or date.today()):
            # Generate a unique transaction_id for this recurrence cycle
            transaction_id = uuid.uuid4()

            for borrower in self.borrowers.all():
                Cost.objects.create(
                    name=self.name,
                    category=self.category,
                    time=timezone.now().time(),
                    date=current_date,
                    amount=(self.amount / self.borrowers.count()),
                    group=self.group,
                    payer=self.payer,
                    borrower=borrower,
                    transaction_id=transaction_id
                )
            current_date += interval
