from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd 
from datetime import datetime, timedelta
from jose import jwt
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
analyzer = SentimentIntensityAnalyzer()

# Secret key and algorithm for JWT encoding
SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")
ALGORITHM = "HS256"

# Fake user store
fake_users_db = {
    "user1": {
        "username": "user1",
        "password": "password123",  # In production, use hashed passwords!
    }
}
class SentimentResponse(BaseModel):
    id: int
    text: str
    sentiment: str
    timestamp: str
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str

# Dependency to get the current user based on the JWT token
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return TokenData(username=username)
    except jwt.JWTError:
        raise credentials_exception

# Token generation for authorized user
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if user is None or user["password"] != form_data.password:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token_expires = timedelta(hours=1)
    access_token = create_access_token(data={"sub": form_data.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# Function to create access token
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=15)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Sentiment Analysis
@app.post("/analyze", dependencies=[Depends(get_current_user)])
async def analyze_csv(file: UploadFile = File(...)):
    try:
        data = pd.read_csv(file.file)
        if "text" not in data.columns:
            raise HTTPException(status_code=400, detail="CSV must contain a 'text' column")
        print(data)
        results = []
        for idx, row in data.iterrows():
            sentiment_score = analyzer.polarity_scores(row["text"])
            sentiment = "positive" if sentiment_score["compound"] > 0.05 else "negative" if sentiment_score["compound"] < -0.05 else "neutral"
            results.append(SentimentResponse(id=row["id"], text=row["text"], sentiment=sentiment, timestamp=row.get("timestamp", datetime.utcnow().isoformat())).dict())
        
        return {"results": results}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)