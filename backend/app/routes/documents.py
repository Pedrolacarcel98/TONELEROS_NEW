import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from uuid import uuid4

from app.db.database import get_db
from app.models.document import Document
from app.schemas.document_schema import DocumentResponse

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        ext = os.path.splitext(file.filename)[1]
        stored_name = f"{uuid4().hex}{ext}"
        dest_path = os.path.join(UPLOAD_DIR, stored_name)
        with open(dest_path, 'wb') as f:
            shutil.copyfileobj(file.file, f)

        doc = Document(stored_name=stored_name, original_name=file.filename, mime_type=file.content_type, size=os.path.getsize(dest_path))
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    try:
        docs = db.query(Document).order_by(Document.created_at.desc()).all()
        return docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail='Document not found')
        return doc
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{doc_id}/download")
def download_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')
    path = os.path.join(UPLOAD_DIR, doc.stored_name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail='File missing on server')
    # Use content_disposition_type="inline" to allow browser viewing
    return FileResponse(
        path, 
        media_type=doc.mime_type or 'application/octet-stream',
        content_disposition_type="inline"
    )


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')
    path = os.path.join(UPLOAD_DIR, doc.stored_name)
    try:
        if os.path.exists(path):
            os.remove(path)
        db.delete(doc)
        db.commit()
        return
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{doc_id}/share")
def share_document(doc_id: int, request: Request, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail='Document not found')
    # Build public URL to the mounted uploads path
    base = str(request.base_url).rstrip('/')
    url = f"{base}/uploads/{doc.stored_name}"
    return {"share_url": url}
