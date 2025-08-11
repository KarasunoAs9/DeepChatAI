from tortoise.models import Model
from tortoise import fields

class ChatMessage(Model):
    id = fields.IntField(pk=True)
    chat = fields.ForeignKeyField(model_name="models.chats", related_name="messages")
    user = fields.ForeignKeyField(model_name="models.users", related_name="chat_messages")
    user_message = fields.TextField()
    bot_responce = fields.TextField()
    time = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "chatmessages"