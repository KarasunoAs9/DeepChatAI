from tortoise.models import Model
from tortoise import fields

class User(Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_lenght=100, unique=True)
    hashed_passwod = fields.CharField()

    class Meta:
        table = "users"