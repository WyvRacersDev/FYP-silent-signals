from pydantic import BaseModel

class User(BaseModel):
    id: int | None = None
    name: str
    email: str
    guardian_name: str = ""
    guardian_contact: str = ""
    font_size: int = 16
    dark_mode: bool = False
    high_contrast: bool = False