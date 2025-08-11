from tortoise.models import Model
from tortoise import fields

class User(Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=100, unique=True)
    hashed_password = fields.CharField(max_length=255)

    class Meta:
        table = "users"