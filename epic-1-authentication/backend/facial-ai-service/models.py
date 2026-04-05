from sqlalchemy import Column, Integer, String
from database import Base

class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, unique=True, index=True)
    encoding = Column(String)  # Numpy array stored as comma-separated string
