import os
import aiofiles
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png", "docx", "zip"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB

def validate_file(file: UploadFile):
    ext = file.filename.split('.')[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"File type {ext} not supported")
    return ext

@router.post("", response_model=dict)
async def upload_file(
    file: UploadFile = File(...)
):
    validate_file(file)
    
    # Read first chunk to check size (fastapi already protects against too large if configured, but we can do a manual check if we read it)
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "File size exceeds 20MB limit")
        
    safe_filename = file.filename.replace(" ", "_").replace("/", "_")
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{timestamp}_{safe_filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)
        
    return {
        "filename": file.filename,
        "url": f"/static_uploads/{filename}"
    }

@router.post("/multiple", response_model=List[dict])
async def upload_multiple(
    files: List[UploadFile] = File(...)
):
    results = []
    for file in files:
        validate_file(file)
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(400, f"File size for {file.filename} exceeds 20MB limit")
            
        safe_filename = file.filename.replace(" ", "_").replace("/", "_")
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{safe_filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)
            
        results.append({
            "filename": file.filename,  # original
            "url": f"/static_uploads/{filename}"
        })
    return results
