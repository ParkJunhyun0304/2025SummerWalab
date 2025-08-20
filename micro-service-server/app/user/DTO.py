from pydantic import BaseModel

class UserData(BaseModel):
    username: str
    avatar: str
    admin_type: str
