from tortoise.models import Model
from tortoise import fields


class Chat(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_lenght=100)
    user = fields.ForeignKeyField(model_name="models.users", related_name="chats")

    class Meta:
        table = "chats"