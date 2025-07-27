from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
from app.models.note import Note, Tag, VisibilityEnum
from app.models.user import User
from app.schemas.note import NoteCreate, NoteUpdate, NoteShare
from fastapi import HTTPException, status

class NotesService:
    @staticmethod
    def create_note(db: Session, note_create: NoteCreate, user: User) -> Note:
        tags = []
        if note_create.tags:
            for tag_name in note_create.tags:
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                    db.flush()
                tags.append(tag)
        
        db_note = Note(
            title=note_create.title,
            content=note_create.content,
            visibility=note_create.visibility,
            owner_id=user.id
        )
        
        db_note.tags = tags
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        return db_note

    @staticmethod
    def get_user_notes(
        db: Session, 
        user: User, 
        search: Optional[str] = None,
        visibility: Optional[VisibilityEnum] = None,
        tags: Optional[List[str]] = None
    ) -> List[Note]:
        query = db.query(Note).filter(
            or_(
                Note.owner_id == user.id,
                Note.visibility == VisibilityEnum.PUBLIC,
                Note.shared_with.any(id=user.id)
            )
        )
        
        if search:
            query = query.filter(
                or_(
                    Note.title.ilike(f"%{search}%"),
                    Note.tags.any(Tag.name.ilike(f"%{search}%"))
                )
            )
        
        if visibility:
            query = query.filter(Note.visibility == visibility)
        
        if tags:
            for tag_name in tags:
                query = query.filter(Note.tags.any(Tag.name == tag_name))
        
        return query.order_by(Note.updated_at.desc()).all()

    @staticmethod
    def get_note(db: Session, note_id: int, user: User) -> Note:
        note = db.query(Note).filter(Note.id == note_id).first()
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
        
        if (note.owner_id != user.id and 
            note.visibility != VisibilityEnum.PUBLIC and
            user not in note.shared_with):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        return note

    @staticmethod
    def update_note(db: Session, note_id: int, note_update: NoteUpdate, user: User) -> Note:
        note = NotesService.get_note(db, note_id, user)
        
        if note.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only owner can update note"
            )
        
        if note_update.title is not None:
            note.title = note_update.title
        if note_update.content is not None:
            note.content = note_update.content
        if note_update.visibility is not None:
            note.visibility = note_update.visibility
        
        if note_update.tags is not None:
            tags = []
            for tag_name in note_update.tags:
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                    db.flush()
                tags.append(tag)
            note.tags = tags
        
        note.updated_at = func.now()
        
        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def delete_note(db: Session, note_id: int, user: User) -> bool:
        note = NotesService.get_note(db, note_id, user)
        
        if note.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only owner can delete note"
            )
        
        db.delete(note)
        db.commit()
        return True

    @staticmethod
    def share_note(db: Session, note_id: int, share_data: NoteShare, user: User) -> Note:
        note = NotesService.get_note(db, note_id, user)
        
        if note.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only owner can share note"
            )
        
        share_user = db.query(User).filter(User.email == share_data.user_email).first()
        if not share_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if share_user.id == user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot share with yourself"
            )
        
        if share_user not in note.shared_with:
            note.shared_with.append(share_user)
            note.visibility = VisibilityEnum.SHARED
            db.commit()
            db.refresh(note)
        
        return note

    @staticmethod
    def generate_public_link(db: Session, note_id: int, user: User) -> dict:
        note = NotesService.get_note(db, note_id, user)
        
        if note.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only owner can generate public links"
            )
        
        public_token = note.generate_public_token()
        db.commit()
        db.refresh(note)
        
        public_url = f"/public/notes/{public_token}"
        
        return {
            "public_url": public_url,
            "public_token": public_token
        }

    @staticmethod
    def get_public_note(db: Session, public_token: str) -> Note:
        note = db.query(Note).filter(Note.public_token == public_token).first()
        
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found or not publicly accessible"
            )
        
        return note

    @staticmethod
    def revoke_public_link(db: Session, note_id: int, user: User) -> bool:
        note = NotesService.get_note(db, note_id, user)
        
        if note.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only owner can revoke public links"
            )
        
        note.public_token = None
        db.commit()
        return True 