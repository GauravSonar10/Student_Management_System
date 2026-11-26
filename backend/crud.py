from typing import Optional
from sqlalchemy.orm import Session
from . import models, schemas


def get_students(
    db: Session,
    search: Optional[str] = None,
    course: Optional[str] = None
):
    query = db.query(models.Student)

    if search and search.strip():
        query = query.filter(models.Student.name.ilike(f"%{search.strip()}%"))

    if course and course != "All":
        query = query.filter(models.Student.course == course)

    return query.order_by(models.Student.id.desc()).all()


def get_student_by_email(db: Session, email: str):
    return db.query(models.Student).filter(models.Student.email.ilike(email)).first()


def get_student_by_mobile(db: Session, mobile: str):
    return db.query(models.Student).filter(models.Student.mobile == mobile).first()


def get_student_by_id(db: Session, student_id: int):
    return db.query(models.Student).filter(models.Student.id == student_id).first()


def create_student(db: Session, student: schemas.StudentCreate):
    db_student = models.Student(
        name=student.name,
        email=student.email,
        mobile=student.mobile,
        course=student.course
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


def update_student(db: Session, student_id: int, student_data: schemas.StudentUpdate):
    db_student = get_student_by_id(db, student_id)
    if not db_student:
        return None
    db_student.name = student_data.name
    db_student.email = student_data.email
    db_student.mobile = student_data.mobile
    db_student.course = student_data.course
    db.commit()
    db.refresh(db_student)
    return db_student


def delete_student(db: Session, student_id: int):
    db_student = get_student_by_id(db, student_id)
    if not db_student:
        return False
    db.delete(db_student)
    db.commit()
    return True