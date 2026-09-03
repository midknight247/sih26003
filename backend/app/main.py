from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Import the new thin API routing endpoints we created for Phase 2
from app.api.routes.patients import router as patient_router
from app.api.routes.sessions import router as session_router

app = FastAPI(title="SIH26003 Core API", version="1.0.0")

# Configure cross-origin requests for your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the routes to your core application loop
app.include_router(patient_router)
app.include_router(session_router)

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "environment": os.getenv("ENVIRONMENT", "development")}

