from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn.functional as F

from model import DigitCNN

MODEL_PATH = "mnist_cnn.pth"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cpu")

model = DigitCNN().to(device)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()


class PredictRequest(BaseModel):
    pixels: List[float]


@app.get("/")
def root():
    return {"message": "backend is running"}


@app.post("/predict")
def predict(request: PredictRequest):
    if len(request.pixels) != 784:
        raise HTTPException(status_code=400, detail="Expected 784 pixel values")

    x = torch.tensor(request.pixels, dtype=torch.float32).view(1, 1, 28, 28)

    with torch.no_grad():
        output = model(x)
        probs = F.softmax(output, dim=1)[0]

    prediction = int(torch.argmax(probs).item())
    confidence = float(probs[prediction].item())

    return {
        "prediction": prediction,
        "confidence": confidence,
        "probabilities": probs.tolist(),
    }