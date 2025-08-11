from tortoise.models import Model
from tortoise import fields


class Chat(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    user = fields.ForeignKeyField(model_name="models.User", related_name="chats")

    class Meta:
        table = "chats"