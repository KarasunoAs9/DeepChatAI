from fastapi import APIRouter
from src.routers.auth import router as auth_router

api_router = APIRouter()

api_router.include_router(router=auth_router, prefix="/auth", tags=["Auth"])

__all__ = ["api_router"]