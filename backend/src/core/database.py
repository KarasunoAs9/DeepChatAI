from tortoise.contrib.fastapi import register_tortoise
from fastapi import FastAPI
from src.core.config import settings


def register_db(app: FastAPI):
    register_tortoise(
        app,
        db_url=settings.DATABASE_URL,
        modules={"models": ["src.models"]},
        generate_schemas=True,
        add_exception_handlers=True
    )