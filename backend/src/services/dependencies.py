from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from fastapi import Depends, HTTPException
from jose import jwt, JWTError
from src.core.config import settings
from src.models.user import User

oauth_bearer = OAuth2PasswordBearer("/auth/sign_in")

async def get_current_user(token: Annotated[str, Depends(oauth_bearer)]):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, settings.ALOGORITHM)
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid auth data")
        
        user = await User.filter(username=username).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate data")