from pathlib import Path
from typing import List, Optional
from fastapi import Depends, FastAPI, HTTPException, Path as FastAPIPath, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import engine, get_db

# Create database tables in PostgreSQL
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API ROUTES ---

@app.get("/api/students", response_model=List[schemas.StudentResponse])
def read_students(
    search: Optional[str] = Query(default=None, description="Filter by student name"),
    course: Optional[str] = Query(default=None, description="Filter by course"),
    db: Session = Depends(get_db)
):
    return crud.get_students(db, search=search, course=course)

@app.post("/api/students", response_model=schemas.StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    if crud.get_student_by_email(db, email=student.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A student with this email already exists."
        )
    if crud.get_student_by_mobile(db, mobile=student.mobile):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A student with this mobile number already exists."
        )
    return crud.create_student(db=db, student=student)

@app.put("/api/students/{student_id}", response_model=schemas.StudentResponse)
def update_student(
    student: schemas.StudentUpdate,
    student_id: int = FastAPIPath(..., gt=0, description="The ID of the student to update"),
    db: Session = Depends(get_db)
):
    existing_email = crud.get_student_by_email(db, email=student.email)
    if existing_email and existing_email.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A student with this email already exists."
        )

    existing_mobile = crud.get_student_by_mobile(db, mobile=student.mobile)
    if existing_mobile and existing_mobile.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A student with this mobile number already exists."
        )

    updated = crud.update_student(db=db, student_id=student_id, student_data=student)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")
    return updated

@app.delete("/api/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int = FastAPIPath(..., gt=0, description="The ID of the student to delete"),
    db: Session = Depends(get_db)
):
    deleted = crud.delete_student(db=db, student_id=student_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")
    return None

# --- SERVE FRONTEND STATIC FILES ---
frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")