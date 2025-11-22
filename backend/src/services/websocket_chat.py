from typing import AsyncGenerator, List, Dict
from src.services.chat import process_chat
from src.models.chat import Chat
from src.models.message import ChatMessage
from src.models.user import User
import asyncio
import json
import logging

class WebSocketChatService:
    """Сервис для обработки реал-тайм чата через WebSocket"""
    
    @staticmethod
    async def get_chat_history(chat: Chat) -> List[Dict[str, str]]:
        """Получить историю чата в формате для агента"""
        messages = await ChatMessage.filter(chat=chat).order_by('time')
        chat_history = []
        for msg in messages:
            chat_history.append({"role": "user", "content": msg.user_message})
            chat_history.append({"role": "assistant", "content": msg.bot_response})
        return chat_history
    
    @staticmethod
    async def process_user_message(
        user_message: str, 
        chat: Chat, 
        user: User,
        websocket_send_func
    ) -> ChatMessage:
        """
        Обработка сообщения пользователя с реал-тайм отправкой ответа
        """
        try:
            # Получение истории для контекста
            chat_history = await WebSocketChatService.get_chat_history(chat)
            
            # Уведомление о начале обработки
            await websocket_send_func({
                "type": "ai_thinking",
                "message": "💙 Внимательно выслушиваю вас..."
            })
            
            # Симуляция задержки для демонстрации
            await asyncio.sleep(0.5)
            
            # Получение ответа от агента
            ai_response = await process_chat(user_message, chat_history)
            
            # Сохранение в БД
            chat_message = await ChatMessage.create(
                chat=chat,
                user=user,
                user_message=user_message,
                bot_response=ai_response
            )
            
            # Отправка финального ответа
            await websocket_send_func({
                "type": "ai_response",
                "message": ai_response,
                "message_id": chat_message.id,
                "timestamp": chat_message.time.isoformat()
            })
            
            return chat_message
            
        except Exception as e:
            logging.error(f"Error processing user message: {e}")
            await websocket_send_func({
                "type": "error",
                "message": f"Произошла ошибка при обработке сообщения: {str(e)}"
            })
            raise
    
    @staticmethod
    async def stream_ai_response(
        user_message: str,
        chat_history: List[Dict[str, str]],
        websocket_send_func
    ) -> str:
        """
        Стриминговая отправка ответа агента (для будущего улучшения)
        """
        # TODO: Реализовать настоящий streaming когда LangChain будет поддерживать
        # Пока что имитируем streaming разбивкой на части
        
        full_response = await process_chat(user_message, chat_history)
        
        # Разбиваем ответ на части для имитации streaming
        words = full_response.split()
        current_response = ""
        
        for i, word in enumerate(words):
            current_response += word + " "
            
            # Отправляем частичный ответ каждые 3-4 слова
            if (i + 1) % 3 == 0 or i == len(words) - 1:
                await websocket_send_func({
                    "type": "ai_streaming",
                    "partial_message": current_response.strip(),
                    "is_complete": i == len(words) - 1
                })
                
                # Небольшая задержка для эффекта печати
                await asyncio.sleep(0.1)
        
        return full_response
    
    @staticmethod
    async def create_new_chat(user: User, chat_name: str = None) -> Chat:
        """Создание нового чата"""
        if not chat_name:
            # Автоматическое именование на основе количества чатов
            chat_count = await Chat.filter(user=user).count()
            chat_name = f"Чат {chat_count + 1}"
        
        chat = await Chat.create(name=chat_name, user=user)
        return chat
    
    @staticmethod
    async def update_chat_title(chat: Chat, user_message: str) -> None:
        """Автоматическое обновление названия чата на основе первого сообщения"""
        message_count = await ChatMessage.filter(chat=chat).count()
        
        # Обновляем название только для первого сообщения
        if message_count == 1 and chat.name.startswith("Чат "):
            # Берём первые 50 символов сообщения как название
            new_title = user_message[:50].strip()
            if len(user_message) > 50:
                new_title += "..."
            
            chat.name = new_title
            await chat.save()
