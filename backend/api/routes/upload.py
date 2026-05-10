import os
import subprocess
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from ...core.config import settings
from ...core.model_loader import load_all_assets

router = APIRouter()

@router.post("")
async def upload_and_process(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    # Save the new file
    temp_path = settings.DATA_DIR / "temp_JakartaFlood.csv"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Backup old file and replace
        if settings.CSV_PATH.exists():
            shutil.move(settings.CSV_PATH, settings.DATA_DIR / "JakartaFlood.csv.bak")
        shutil.move(temp_path, settings.CSV_PATH)
        
        # Run mount_outputs.py
        mount_script = settings.BASE_DIR / "mount_outputs.py"
        process = subprocess.run(
            ["python", str(mount_script)],
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if process.returncode != 0:
            # Restore backup if failed
            if (settings.DATA_DIR / "JakartaFlood.csv.bak").exists():
                shutil.move(settings.DATA_DIR / "JakartaFlood.csv.bak", settings.CSV_PATH)
            return {
                "status": "error",
                "detail": "Failed to process data",
                "logs": process.stderr
            }
        
        # Reload assets
        load_all_assets()
        
        return {
            "status": "success",
            "message": "Data uploaded and processed successfully",
            "logs": process.stdout
        }
        
    except Exception as e:
        # Rollback: restore backup if it exists
        backup_path = settings.DATA_DIR / "JakartaFlood.csv.bak"
        if backup_path.exists() and not settings.CSV_PATH.exists():
            shutil.move(str(backup_path), str(settings.CSV_PATH))
        raise HTTPException(status_code=500, detail=str(e))
