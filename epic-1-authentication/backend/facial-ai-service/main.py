from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import py_eureka_client.eureka_client as eureka_client
import uvicorn
import os
import io
import asyncio
import numpy as np
import face_recognition

from database import engine, get_db
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Service for Facial Recognition")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Eureka Configuration
EUREKA_SERVER = os.getenv("EUREKA_SERVER", "http://discovery-service:8761/eureka").rstrip("/")
APP_NAME = os.getenv("SERVICE_NAME", "face-recognition-service")
INSTANCE_PORT = int(os.getenv("SERVICE_PORT", "8082"))
INSTANCE_HOST = os.getenv("EUREKA_INSTANCE_HOST", "face-recognition-service")

async def register_with_eureka():
    """Try to register with Eureka, returns True on success."""
    try:
        await eureka_client.init_async(
            eureka_server=EUREKA_SERVER,
            app_name=APP_NAME,
            instance_port=INSTANCE_PORT,
            instance_host=INSTANCE_HOST
        )
        print("Registered with Eureka successfully")
        return True
    except Exception as e:
        print(f"Eureka registration failed: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    # Try registering with Eureka at startup with retries
    for attempt in range(1, 31):
        if await register_with_eureka():
            return
        wait = min(5, attempt)
        print(f"Retrying Eureka registration in {wait}s (attempt {attempt}/30)...")
        await asyncio.sleep(wait)

    # If startup retries failed, keep retrying in the background
    print("Eureka startup registration failed. Continuing with background retries...")
    asyncio.create_task(eureka_background_retry())

async def eureka_background_retry():
    """Background task that keeps trying to register with Eureka."""
    while True:
        await asyncio.sleep(15)
        if await register_with_eureka():
            return

@app.get("/health")
def health_check():
    return {"status": "UP"}

@app.post("/api/v1/faces/register")
async def register_face(
    user_email: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    existing = db.query(models.FaceEmbedding).filter(models.FaceEmbedding.user_email == user_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Face already registered for this user")
    
    image_bytes = await file.read()
    try:
        image = face_recognition.load_image_file(io.BytesIO(image_bytes))
        locations = face_recognition.face_locations(image)
        if len(locations) == 0:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        if len(locations) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces detected in the image")

        encodings = face_recognition.face_encodings(image, known_face_locations=locations)
        if not encodings:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        
        encoding = encodings[0]
        encoding_str = ",".join(map(str, encoding))
        
        new_embedding = models.FaceEmbedding(user_email=user_email, encoding=encoding_str)
        db.add(new_embedding)
        db.commit()
        
        return {"message": "Face registered successfully", "user_email": user_email}
    except Exception as e:
        print(f"ERROR in register_face: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/faces/verify")
async def verify_face(
    user_email: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Liveness Detection Placeholder
    # TODO: Implement blink detection or temporal depth analysis
    
    saved_entity = db.query(models.FaceEmbedding).filter(models.FaceEmbedding.user_email == user_email).first()
    if not saved_entity:
        raise HTTPException(status_code=404, detail="No face registered for this user")
    
    known_encoding = np.array([float(x) for x in saved_entity.encoding.split(",")])
    
    image_bytes = await file.read()
    try:
        image = face_recognition.load_image_file(io.BytesIO(image_bytes))
        locations = face_recognition.face_locations(image)
        if len(locations) == 0:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        if len(locations) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces detected in the image")

        encodings = face_recognition.face_encodings(image, known_face_locations=locations)
        if not encodings:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        
        unknown_encoding = encodings[0]
        
        results = face_recognition.compare_faces([known_encoding], unknown_encoding, tolerance=0.55)
        is_match = bool(results[0])
        
        message = "Face verified" if is_match else "Face does not match"
        return {"verified": is_match, "user_email": user_email, "message": message}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/faces/identify")
async def identify_face(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    image_bytes = await file.read()
    print(f"DEBUG: identify_face received {len(image_bytes)} bytes")
    try:
        image = face_recognition.load_image_file(io.BytesIO(image_bytes))
        print(f"DEBUG: image loaded successfully, shape: {image.shape}")
        locations = face_recognition.face_locations(image)
        if len(locations) == 0:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        if len(locations) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces detected in the image")

        encodings = face_recognition.face_encodings(image, known_face_locations=locations)
        if not encodings:
            raise HTTPException(status_code=400, detail="No face detected in the image")

        unknown_encoding = encodings[0]
        
        # Fetch all registered faces
        all_faces = db.query(models.FaceEmbedding).all()
        if not all_faces:
             raise HTTPException(status_code=404, detail="No faces registered in the system")
        
        known_encodings = []
        emails = []
        for face in all_faces:
            known_encodings.append(np.array([float(x) for x in face.encoding.split(",")]))
            emails.append(face.user_email)
            
        distances = face_recognition.face_distance(known_encodings, unknown_encoding)
        best_index = int(np.argmin(distances))
        best_distance = float(distances[best_index])

        threshold = 0.5
        if best_distance <= threshold:
            matched_email = emails[best_index]
            return {
                "identified": True,
                "user_email": matched_email,
                "message": "Face recognized",
                "distance": best_distance,
            }

        return {"identified": False, "message": "Face not recognized"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/faces")
async def delete_face(
    user_email: str,
    db: Session = Depends(get_db)
):
    face = db.query(models.FaceEmbedding).filter(models.FaceEmbedding.user_email == user_email).first()
    if not face:
        # We don't necessarily want to error out if it's already gone, but for debugging let's keep it 404
        return {"message": "Face not found, nothing to delete", "user_email": user_email}
    
    db.delete(face)
    db.commit()
    return {"message": "Face deleted successfully", "user_email": user_email}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=INSTANCE_PORT)

