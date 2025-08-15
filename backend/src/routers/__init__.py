from fastapi import APIRouter
from src.routers.auth import router as auth_router
from src.routers.user import router as user_router
from src.routers.chat import router as chat_router
from src.routers.websocket import router as websocket_router
api_router = APIRouter()

api_router.include_router(router=auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(router=user_router, prefix="/user", tags=["User"])
api_router.include_router(router=chat_router, prefix="/chat", tags=["Chat"])
api_router.include_router(router=websocket_router, tags=["WebSocket"])

__all__ = ["api_router"]