from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from clean_bankstatements import clean_bank_statement_df
import pandas as pd
import io
from pathlib import Path
import traceback
from fastapi import Header, HTTPException, Depends
import jwt
import os

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

def verify_jwt(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=403, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_exp": False})
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=403, detail="Invalid  or expired token")

app = FastAPI()

# Enable CORS for your frontend app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://budgetm.onrender.com"],  # <- Change this to your React dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "API running"}

@app.post("/clean-csv")
async def clean_csv(file: UploadFile = File(...), user=Depends(verify_jwt)):
    contents = await file.read()
    try:
        raw_df = pd.read_csv(io.BytesIO(contents), encoding="latin1", delimiter=";")
        cleaned_df = clean_bank_statement_df(raw_df)

        #save the file to correct folder
        project_root = Path(__file__).resolve().parent.parent
        cleaned_dir = project_root / "data" / "cleaned"
        cleaned_dir.mkdir(parents=True, exist_ok=True)

        output_path = cleaned_dir / "april2025cleaned.csv"
        print("✅ Saving cleaned CSV to disk...")
        cleaned_df.to_csv(output_path, index=False)
        print(f"✅ File saved at: {output_path}")
        return cleaned_df.to_dict(orient="records")
    
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}
    
@app.get("/transaction-type")
def get_transaction_types():
    project_root = Path(__file__).resolve().parent.parent
    cleaned_csv_path = project_root / "data" / "cleaned" / "april2025cleaned.csv"

    if not cleaned_csv_path.exists():
        return {"error": "No cleaned CSV file found"}
    
    df = pd.read_csv(cleaned_csv_path)
    unique_types = df["type"].dropna().unique().tolist()

    return unique_types