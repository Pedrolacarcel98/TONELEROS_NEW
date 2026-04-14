from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import uuid
import shutil
from typing import List
from app.db.database import get_db
from app.models.media import Media
from app.schemas.media_schema import MediaResponse

router = APIRouter(prefix="/api/media", tags=["media"])

UPLOAD_DIR = "uploads/media"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=List[MediaResponse])
def list_media(media_type: str = None, db: Session = Depends(get_db)):
    query = db.query(Media)
    if media_type:
        query = query.filter(Media.media_type == media_type.upper())
    return query.order_by(Media.created_at.desc()).all()


@router.post("/upload", response_model=MediaResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    media_type: str = Form(...),
    db: Session = Depends(get_db)
):
    # Ensure directory
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    stored_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_name)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        new_media = Media(
            stored_name=stored_name,
            original_name=file.filename,
            mime_type=file.content_type,
            media_type=media_type.upper(),
            size=os.path.getsize(file_path)
        )
        db.add(new_media)
        db.commit()
        db.refresh(new_media)
        return new_media
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{media_id}")
def download_media(media_id: int, db: Session = Depends(get_db)):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    file_path = os.path.join(UPLOAD_DIR, media.stored_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=file_path,
        filename=media.original_name,
        media_type=media.mime_type
    )


@router.get("/view/{media_id}")
def view_media(media_id: int, db: Session = Depends(get_db)):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    file_path = os.path.join(UPLOAD_DIR, media.stored_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(path=file_path, media_type=media.mime_type)


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(media_id: int, db: Session = Depends(get_db)):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    file_path = os.path.join(UPLOAD_DIR, media.stored_name)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
        db.delete(media)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
