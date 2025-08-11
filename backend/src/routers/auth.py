from fastapi import APIRouter, HTTPException
from src.models.user import User
from src.schemas.user import UserCreate
from src.core.security import hash_password, verify_password

router = APIRouter()

@router.post("/register")
async def register_new_user(user: UserCreate):
    unique_user = await User.get_or_none(username=user.username)
    if unique_user is not None:
        raise HTTPException(status_code=409, detail="this username already exist")
    user_model = await User.create(username=user.username,
                                    hashed_password=hash_password(user.password))
    return HTTPException(status_code=201, detail="Succsessfully register")
