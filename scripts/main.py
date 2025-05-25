from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from clean_bankstatements import clean_bank_statement_df
import pandas as pd
import io

app = FastAPI()

# Enable CORS for your frontend app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # <- Change this to your React dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "API running"}

@app.post("/clean-csv")
async def clean_csv(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        raw_df = pd.read_csv(io.BytesIO(contents), encoding="latin1", delimiter=";")
        cleaned_df = clean_bank_statement_df(raw_df)
        return cleaned_df.to_dict(orient="records")
    except Exception as e:
        return {"error": str(e)}