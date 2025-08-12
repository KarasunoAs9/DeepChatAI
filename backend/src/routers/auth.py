from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from src.models.user import User
from src.schemas.user import UserCreate
from src.schemas.auth import ChangePassword
from src.core.security import hash_password, verify_password
from datetime import timedelta, datetime, timezone
from jose import JWTError, jwt
from src.core.config import settings
from src.services.dependencies import get_current_user

router = APIRouter()


def create_access_token(data: dict, timedelta: timedelta):
    to_encode = data.copy()
    expires = datetime.now(timezone.utc) + timedelta
    to_encode.update({"exp": expires})
    return jwt.encode(to_encode, settings.SECRET_KEY, settings.ALOGORITHM)

@router.post("/register")
async def register_new_user(user: UserCreate):
    unique_user = await User.get_or_none(username=user.username)
    if unique_user is not None:
        raise HTTPException(status_code=409, detail="this username already exist")
    user_model = await User.create(username=user.username,
                                    hashed_password=hash_password(user.password))
    return HTTPException(status_code=201, detail="Succsessfully register")

@router.post("/sign_in")
async def login_user(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await User.filter(username=form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail=f"Invalid data , {form_data.username}")
    
    token = create_access_token({"sub": user.username}, timedelta=timedelta(minutes=30))
    return {"access_token": token, "token_type": "bearer"}

@router.put("/change_password")
async def change_user_password(form_data: ChangePassword, current_user: Annotated[dict, Depends(get_current_user)]):
    current_password = form_data.current_password
    new_password = form_data.new_password

    if not current_password or not new_password:
        raise HTTPException(status_code=401, detail="Invalid data")
    
    if not verify_password(current_password, current_user.hashed_password):
        raise  HTTPException(status_code=401, detail="Type a right current password")
    
    current_user.hashed_password = hash_password(new_password)
    await current_user.save()