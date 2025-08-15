from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, List
from jose import jwt, JWTError
from src.core.config import settings
from src.models.user import User
from src.models.chat import Chat
from src.models.message import ChatMessage
from src.services.websocket_chat import WebSocketChatService
import json
import logging

router = APIRouter()
oauth_bearer = OAuth2PasswordBearer("/auth/sign_in")

# Хранилище активных WebSocket соединений
active_connections: Dict[int, WebSocket] = {}

async def get_user_from_token(token: str):
    """Получить пользователя из JWT токена для WebSocket"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await User.filter(username=username).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.websocket("/ws/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: int, token: str):
    """WebSocket эндпоинт для реал-тайм чата"""
    user = None
    try:
        # Аутентификация через query параметр token
        user = await get_user_from_token(token)
        
        # Проверка доступа к чату
        chat = await Chat.get_or_none(id=chat_id, user=user)
        if not chat:
            await websocket.close(code=4004, reason="Chat not found or access denied")
            return
            
        await websocket.accept()
        active_connections[user.id] = websocket
        
        # Отправка приветственного сообщения
        await websocket.send_json({
            "type": "connected",
            "message": f"Подключено к чату: {chat.name}",
            "chat_id": chat_id
        })
        
        try:
            while True:
                # Получение сообщения от клиента
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                if message_data.get("type") == "user_message":
                    user_message = message_data.get("message", "").strip()
                    if not user_message:
                        continue
                    
                    # Отправка подтверждения получения сообщения
                    await websocket.send_json({
                        "type": "message_received",
                        "message": user_message
                    })
                    
                    # Обработка сообщения через WebSocketChatService
                    try:
                        chat_message = await WebSocketChatService.process_user_message(
                            user_message=user_message,
                            chat=chat,
                            user=user,
                            websocket_send_func=websocket.send_json
                        )
                        
                        # Автоматическое обновление названия чата
                        await WebSocketChatService.update_chat_title(chat, user_message)
                        
                    except Exception as e:
                        logging.error(f"Error in WebSocket chat service: {e}")
                        
        except WebSocketDisconnect:
            pass
            
    except Exception as e:
        logging.error(f"WebSocket connection error: {e}")
        try:
            await websocket.close(code=4000, reason="Authentication failed")
        except:
            pass
    finally:
        # Удаление из активных соединений
        if user and user.id in active_connections:
            del active_connections[user.id]

@router.websocket("/ws/new")
async def websocket_new_chat(websocket: WebSocket, token: str):
    """WebSocket эндпоинт для создания нового чата"""
    try:
        user = await get_user_from_token(token)
        await websocket.accept()
        
        # Создание нового чата через сервис
        chat = await WebSocketChatService.create_new_chat(user)
        
        await websocket.send_json({
            "type": "chat_created",
            "chat_id": chat.id,
            "chat_name": chat.name,
            "redirect": f"/chat/{chat.id}"
        })
        
        await websocket.close()
        
    except Exception as e:
        logging.error(f"Error creating new chat: {e}")
        try:
            await websocket.close(code=4000, reason="Failed to create chat")
        except:
            pass