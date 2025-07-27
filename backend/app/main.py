from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth import auth
from app.api.notes import notes
from app.api.notes import public
from app.api.users import settings as user_settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(public.router, prefix="/api/public/notes", tags=["public"])
app.include_router(user_settings.router, prefix="/api/users", tags=["users"])

@app.get("/")
def read_root():
    return {
        "message": "Welcome to CollabNotes API",
        "version": settings.VERSION,
        "docs": "/docs"
    }
