from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.note import VisibilityEnum
from app.schemas.note import Note, NoteCreate, NoteUpdate, NoteShare, PublicNote, PublicLinkResponse
from app.services.notes import NotesService

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_note(
    note_create: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    note = NotesService.create_note(db, note_create, current_user)
    
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "visibility": note.visibility.value,
        "owner_id": note.owner_id,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "tags": note.tags,
        "shared_with": [user.email for user in note.shared_with] if note.shared_with else [],
        "public_token": note.public_token
    }

@router.get("/")
def get_notes(
    search: Optional[str] = Query(None, description="Search by title or tags"),
    visibility: Optional[VisibilityEnum] = Query(None, description="Filter by visibility"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    notes = NotesService.get_user_notes(db, current_user, search, visibility, tags)
    
    return [
        {
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "visibility": note.visibility.value,
            "owner_id": note.owner_id,
            "created_at": note.created_at,
            "updated_at": note.updated_at,
            "tags": note.tags,
            "shared_with": [user.email for user in note.shared_with] if note.shared_with else [],
            "public_token": note.public_token
        }
        for note in notes
    ]

@router.get("/{note_id}")
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    note = NotesService.get_note(db, note_id, current_user)
    
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "visibility": note.visibility.value,
        "owner_id": note.owner_id,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "tags": note.tags,
        "shared_with": [user.email for user in note.shared_with] if note.shared_with else [],
        "public_token": note.public_token
    }

@router.put("/{note_id}")
def update_note(
    note_id: int,
    note_update: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    note = NotesService.update_note(db, note_id, note_update, current_user)
    
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "visibility": note.visibility.value,
        "owner_id": note.owner_id,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "tags": note.tags,
        "shared_with": [user.email for user in note.shared_with] if note.shared_with else [],
        "public_token": note.public_token
    }

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    NotesService.delete_note(db, note_id, current_user)
    return None

@router.post("/{note_id}/share")
def share_note(
    note_id: int,
    share_data: NoteShare,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    note = NotesService.share_note(db, note_id, share_data, current_user)
    
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "visibility": note.visibility.value,
        "owner_id": note.owner_id,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "tags": note.tags,
        "shared_with": [user.email for user in note.shared_with] if note.shared_with else [],
        "public_token": note.public_token
    }

@router.post("/{note_id}/public-link", response_model=PublicLinkResponse)
def generate_public_link(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return NotesService.generate_public_link(db, note_id, current_user)

@router.delete("/{note_id}/public-link", status_code=status.HTTP_204_NO_CONTENT)
def revoke_public_link(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    NotesService.revoke_public_link(db, note_id, current_user)
    return None 