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

#function for verifying jwt with required header.
def verify_jwt(authorization: str = Header(...)):
    #checks that header uses standard bearer format and raises error if it doesnt
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=403, detail="Invalid authorization header")
    
    #replace bearer with "" to get ready to extract the actual token
    token = authorization.replace("Bearer ", "")

    #try block that tries to decode token using supabase jwt secret and HS256 algorithm.
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"  
        )
        return payload
    #if decode fails error is printed
    except jwt.PyJWTError as e:
        print("❌ JWT decode error:", e)
        raise HTTPException(status_code=403, detail=str(e))
#creaetes FastAPI instance
app = FastAPI()

# Enable CORS for frontend app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://budgetmaster-uhey.onrender.com"],  # <- Change this to your React dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Route to check if API is running
@app.get("/")
def root():
    return {"status": "API running"}

#endpoint for csv cleaning. expects a file upload and use is protected with jwt, so non-authorized users cannot access this.
@app.post("/clean-csv")
async def clean_csv(file: UploadFile = File(...), user=Depends(verify_jwt)):
    #reads uploaded file
    contents = await file.read()
    
    #loads data into to pandas df and uses imported function to clean it
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

#Endpoint for retrieving transaction types from the cleaned csv file. these types are then used when adding transaction. They can be used to give a transaction a type -> "Food"
@app.get("/transaction-type")
def get_transaction_types():
    project_root = Path(__file__).resolve().parent.parent
    cleaned_csv_path = project_root / "data" / "cleaned" / "april2025cleaned.csv"

    #if path to cleaned file does not exist returns error.
    if not cleaned_csv_path.exists():
        return {"error": "No cleaned CSV file found"}
    
    #saves unique types in a variable to ensure no duplicates.
    df = pd.read_csv(cleaned_csv_path)
    unique_types = df["type"].dropna().unique().tolist()

    return unique_types