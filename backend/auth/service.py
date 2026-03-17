from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from config import settings
from auth.models import User
from auth.schemas import UserCreate, UserUpdate
from database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).where(User.user_id == user_id))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        bio=user.bio,
        skills=user.skills
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user(db: AsyncSession, user: User, user_update: UserUpdate):
    if user_update.email is not None and user_update.email != user.email:
        # Email change requested: Verify password and check uniqueness
        if not user_update.current_password or not verify_password(user_update.current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization failed: Incorrect password"
            )
        
        # Check if email is already taken
        existing_user = await get_user_by_email(db, user_update.email)
        if existing_user and existing_user.user_id != user.user_id:
            raise HTTPException(status_code=400, detail="This email is already registered.")
        
        user.email = user_update.email

    if user_update.name is not None:
        user.name = user_update.name
    if user_update.bio is not None:
        user.bio = user_update.bio
    if user_update.skills is not None:
        user.skills = user_update.skills
        
    await db.commit()
    await db.refresh(user)
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

async def google_login(db: AsyncSession, token: str, role: str):
    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), settings.GOOGLE_CLIENT_ID)
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        
        # Check if user already exists
        user = await get_user_by_email(db, email)
        if not user:
            # Create a new user (with a dummy password for Google users)
            # In a real app, you might want a 'is_google_user' flag or separate auth method
            dummy_password = f"google_{token[:10]}"
            user = User(
                name=name,
                email=email,
                password_hash=get_password_hash(dummy_password),
                role=role,
                bio=f"Authenticated via Google"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
        return user
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")
