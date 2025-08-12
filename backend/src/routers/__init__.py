from fastapi import APIRouter
from src.routers.auth import router as auth_router
from src.routers.user import router as user_router

api_router = APIRouter()

api_router.include_router(router=auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(router=user_router, prefix="/user", tags=["User"])

__all__ = ["api_router"]