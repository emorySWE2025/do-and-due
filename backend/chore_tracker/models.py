from django.db import models


class User(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=40)
    username = models.CharField(max_length=40)
    password = models.CharField(max_length=162)
    email = models.EmailField(max_length=60)
    photo_url = models.CharField(max_length=60, default="None")

    def __str__(self):
        return self.username


class Group(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=60)
    status = models.CharField(max_length=30)
    expiration = models.DateTimeField(null=True, blank=True)
    timezone = models.CharField(max_length=30)

    # Relationships
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_groups")
    members = models.ManyToManyField(User, related_name="joined_groups")

    def __str__(self):
        return self.name


class Event(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=60)
    first_date = models.DateField()
    first_time = models.TimeField()
    repeat_every = models.CharField(max_length=40, null=True, blank=True)

    # Relationships
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="events")
    members = models.ManyToManyField(User, related_name="events")

    def __str__(self):
        return self.name


class Cost(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=60)
    category = models.CharField(max_length=40, null=True, blank=True)
    amount = models.FloatField()

    # Relationships
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="costs")
    borrower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="borrower")
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="costs")

    def __str__(self):
        return self.name
