from fastapi import FastAPI, File

import numpy as np
import cv2
from fastapi.middleware.cors import CORSMiddleware
from model import *

app = FastAPI()

origins = [
    'http://127.0.0.1',
    'http://localhost',
    'http://localhost:3000'
    
]
model = TextModel('/Users/egorgarmanov/Machine Learning/CheckIn/WonePassportDocker/wonePassports/tuning3.hdf5')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/word")
async def read_passport(image: bytes = File(...)):

    nparr = np.fromstring(image, np.uint8)
    # decode image
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)


    return TextPrediction(img, model)





