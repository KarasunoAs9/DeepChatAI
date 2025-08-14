from fastapi import APIRouter
from src.schemas.chat import CreateChat
from src.services.dependencies import get_current_user
from typing import Annotated
from fastapi import Depends, HTTPException
from src.models.chat import Chat
from src.models.message import ChatMessage

router = APIRouter()

@router.get("/my")
async def get_user_chats(current_user: Annotated[dict, Depends(get_current_user)]):
    chats = await Chat.filter(user=current_user).all()
    if not chats:
        raise HTTPException(status_code=404, detail="Not found any chats for this user")
    
    return chats

@router.post("/new_chat")
async def create_new_chat(chat: CreateChat, current_user: Annotated[dict, Depends(get_current_user)]):  
    chat_model = await Chat.create(
        name=chat.name or "New Chat",
        user=current_user
    )
    return {"chat_id": chat_model.id}

@router.get("/{chat_id}/history")
async def get_chat_history(chat_id: int, current_user: Annotated[dict, Depends(get_current_user)]):
    chat = await Chat.get_or_none(id=chat_id, user=current_user)
    if not chat:
        raise HTTPException(status_code=404, detail=f"Chat with id: {chat_id} and this user: {get_current_user} not found")
    
    messages = await ChatMessage.filter(chat=chat).all()
    formated_message = []
    for message in messages:
        formated_message.append({
            "id": message.id + "_user",
            "role": "user",
            "content": message.user_message
        })
        formated_message.append({
            "id": message.id + "_assistant",
            "role": "assistant",
            "content": message.bot_response
        })
    return formated_message

    

@router.patch("/rename_chat/{id}")
async def rename_user_chat(id: int, new_name: str, current_user: Annotated[dict, Depends(get_current_user)]):
    chat = await Chat.get_or_none(id=id, user=current_user)
    if not chat:
        raise HTTPException(status_code=404, detail=f"Chat with id: {id} and this user: {get_current_user} not found")
    
    chat.name = new_name
    await chat.save()
    
    return {"message": "chat renamed successfully", "chat_id": chat.id, "new_name": new_name}
                           
@router.delete("/delete_chat/{id}", status_code=204)
async def delete_user_chat(id: int, current_user: Annotated[dict, Depends(get_current_user)]):
    chat = await Chat.get_or_none(id=id, user=current_user)
    if not chat:
        raise HTTPException(status_code=404, detail=f"Chat with id: {id} and this user: {get_current_user} not found")
    
    await ChatMessage.filter(chat=chat).delete()
    await chat.delete()
