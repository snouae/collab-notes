from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.note import PublicNote
from app.services.notes import NotesService

router = APIRouter()

@router.get("/{public_token}", response_model=PublicNote)
def get_public_note(
    public_token: str,
    db: Session = Depends(get_db)
):
    note = NotesService.get_public_note(db, public_token)
    
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "visibility": note.visibility.value,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "tags": note.tags,
        "public_token": note.public_token
    } 