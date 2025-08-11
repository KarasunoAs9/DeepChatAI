from tortoise.models import Model
from tortoise import fields

class ChatMessage(Model):
    id = fields.IntField(pk=True)
    chat = fields.ForeignKeyField(model_name="models.Chat", related_name="messages")
    user = fields.ForeignKeyField(model_name="models.User", related_name="chat_messages")
    user_message = fields.TextField()
    bot_response = fields.TextField()
    time = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "chatmessages"