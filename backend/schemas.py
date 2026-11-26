import re
from typing import Literal
from pydantic import BaseModel, EmailStr, field_validator

CourseType = Literal["HTML", "CSS", "JavaScript", "Python", "Django", "SQL"]

class StudentBase(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    course: CourseType

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2 or len(cleaned) > 100:
            raise ValueError("Name must be between 2 and 100 characters.")
        if not re.match(r"^[A-Za-z\s.'-]+$", cleaned):
            raise ValueError("Name can only contain letters, spaces, dots, hyphens, and apostrophes.")
        return cleaned

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, value: str) -> str:
        cleaned = value.strip()
        if not re.match(r"^[6-9]\d{9}$", cleaned):
            raise ValueError("Mobile number must be 10 digits starting with 6, 7, 8, or 9.")
        return cleaned

class StudentCreate(StudentBase):
    pass

class StudentUpdate(StudentBase):
    pass

class StudentResponse(StudentBase):
    id: int

    class Config:
        from_attributes = True