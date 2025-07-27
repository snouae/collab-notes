from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User
from app.models.note import Note, Tag, VisibilityEnum

def init_test_data(db: Session) -> None:
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        test_user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=get_password_hash("password123"),
            is_active=True
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        tags = [
            Tag(name="important"),
            Tag(name="work"),
            Tag(name="personal")
        ]
        for tag in tags:
            db.add(tag)
        db.commit()

        welcome_note = Note(
            title="Welcome to CollabNotes",
            content="# Welcome!\n\nThis is your first note. You can:\n- Write in Markdown\n- Add tags\n- Share with other users",
            visibility=VisibilityEnum.PRIVATE,
            owner_id=test_user.id,
            tags=[tags[0]]
        )

        guide_note = Note(
            title="User Guide",
            content="## How to use CollabNotes\n\n1. Create a note\n2. Use Markdown for formatting\n3. Add tags\n4. Share with colleagues",
            visibility=VisibilityEnum.PUBLIC,
            owner_id=test_user.id,
            tags=[tags[0], tags[1]]
        )

        db.add(welcome_note)
        db.add(guide_note)
        db.commit()

if __name__ == "__main__":
    from app.db.database import SessionLocal
    db = SessionLocal()
    init_test_data(db)
    db.close()
    print("Test data initialized successfully!") 