from pydantic import BaseModel, EmailStr


class UserProfile(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    roles: list[str]
    status: str


class UserProfileResponse(BaseModel):
    data: UserProfile
