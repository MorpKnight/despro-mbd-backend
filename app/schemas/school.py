from pydantic import BaseModel


class SchoolBase(BaseModel):
    namaSekolah: str
    alamat: str


class SchoolCreate(SchoolBase):
    pass


class SchoolOut(SchoolBase):
    id: str
    apiKey: str

    class Config:
        from_attributes = True
