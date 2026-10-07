"""
NeuroPredict AI - FastAPI Backend Server
REST API for 8-model Alzheimer's prediction system.
"""
import os
import json
import traceback
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any

from ml_engine import MLEngine, MODEL_STARS

# ── Initialize FastAPI ────────────────────────────────────────────────────
app = FastAPI(
    title="NeuroPredict AI API",
    description="8-model Alzheimer's Disease Prediction System",
    version="2.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Initialize ML Engine (trains on startup) ─────────────────────────────
print("[INIT] Initializing ML Engine -- training 8 models...")
engine = MLEngine()
print("[OK] ML Engine ready!")

# Store patient predictions for mobile view lookup
patient_store: Dict[str, dict] = {}


# ── Pydantic models ──────────────────────────────────────────────────────
class PatientData(BaseModel):
    data: Dict[str, Any]
    model_name: Optional[str] = None
    patient_id: Optional[str] = None


# ── Health Check ──────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {
        "status": "online",
        "model_version": "ANN v2.4",
        "models_count": 8,
        "is_trained": engine.is_trained,
        "best_model": engine.best_model_name,
    }


# ── Get All Model Metrics ────────────────────────────────────────────────
@app.get("/api/models/metrics")
async def get_metrics():
    return {
        "metrics": engine.get_all_metrics(),
        "dataset_info": engine.dataset_info,
        "best_model": engine.best_model_name,
        "model_stars": MODEL_STARS,
    }


# ── Train on Custom Dataset ──────────────────────────────────────────────
@app.post("/api/train")
async def train_custom(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        filename = file.filename or "data.csv"
        info = engine.train_custom_dataset(contents, filename)
        return {
            "status": "success",
            "message": f"Trained on {info['total_records']} records — "
                       f"{info['train_size']} train / {info['test_size']} test",
            "dataset_info": info,
            "metrics": engine.get_all_metrics(),
            "best_model": engine.best_model_name,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


# ── Single Patient Prediction ────────────────────────────────────────────
@app.post("/api/predict")
async def predict(patient: PatientData):
    try:
        result = engine.predict_single(patient.data, patient.model_name)

        # Store for mobile view
        pid = patient.patient_id or str(hash(json.dumps(patient.data, default=str)) % 100000)
        patient_store[pid] = {
            **result,
            'patient_data': patient.data,
            'patient_id': pid,
        }

        result['patient_id'] = pid
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# ── Get Patient Prediction (for Mobile View) ─────────────────────────────
@app.get("/api/patient/{patient_id}")
async def get_patient(patient_id: str):
    if patient_id not in patient_store:
        raise HTTPException(status_code=404, detail="Patient prediction not found")
    return patient_store[patient_id]


# ── Batch Prediction ─────────────────────────────────────────────────────
@app.post("/api/batch-predict")
async def batch_predict(file: UploadFile = File(...), model_name: Optional[str] = None):
    try:
        contents = await file.read()
        filename = file.filename or "test_data.csv"
        predictions = engine.batch_predict(contents, filename, model_name)
        return {
            "status": "success",
            "total": len(predictions),
            "predictions": predictions,
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


# ── Parse Patient File for Lookup ─────────────────────────────────────────
@app.post("/api/parse-patients")
async def parse_patients(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        filename = file.filename or "patients.csv"
        patients = engine.parse_patients_file(contents, filename)
        return {
            "status": "success",
            "total": len(patients),
            "patients": patients,
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"File parsing failed: {str(e)}")


# ── Feature names for the form ────────────────────────────────────────────
@app.get("/api/features")
async def get_features():
    return {
        "features": engine.feature_names,
        "model_names": list(MODEL_STARS.keys()),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
