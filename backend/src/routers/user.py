from fastapi import APIRouter, HTTPException, Depends
from src.services.dependencies import get_current_user
from typing import Annotated
from src.models.user import User

router = APIRouter()


@router.get("/me")
async def get_current_user_data(current_user: Annotated[dict, Depends(get_current_user)]):
    user_data = await User.filter(username=current_user.username).first()
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid user data")
    
    return user_data