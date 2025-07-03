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
from supabase import create_client

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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


@app.post("/reset-guest")
def reset_guest_data(authorization: str = Header(...)):
    #Verify that its guest user:
    payload = verify_jwt(authorization)
    user_id = payload["sub"]
    email = payload.get("email")

    if email != "guest@budgetmaster.com":
        raise HTTPException(status_code=403, detail="Only guest user can trigger data reset")
    
    try:
        #delete input data
        supabase.table("transactions").delete.eq("user_id", user_id).execute()
        supabase.table("savings_goals").delete.eq("user_id", user_id).execute()
        supabase.table("budgets").delete.eq("user_id", user_id).execute()

        #insert example data

        supabase.table("budgets").insert([
            {"user_id": user_id, "name": "food", "plannedbudget": 5500, "moneySpent": 0, "month": "2025-07", "is-recurring": True},
            {"user_id": user_id, "name": "Monthly expenses", "plannedbudget": 25000, "moneySpent": 0, "month": "2025-07", "is-recurring": True}     
        ]).execute()

        supabase.table("savings_goals").insert([
            {"user_id": user_id, "targetAmount": 15000, "deadline": "2025-09-01", "name": "vacation", "savedAmount": 0},
            {"user_id": user_id, "targetAmount": 1000000, "deadline": "2040-09-01", "name": "retirement", "savedAmount": 0}
        ]).execute()

        supabase.table("transactions").insert([
            {"user_id": user_id, "date":" 2025-07-01", "type": "food", "category": "expense", "amount": 500, "description": "kiwi", "is_recurring": False},
            {"user_id": user_id, "date":" 2025-07-07", "type": "food", "category": "expense", "amount": 1500, "description": "kiwi", "is_recurring": False},
            {"user_id": user_id, "date":" 2025-07-13", "type": "food", "category": "expense", "amount": 741, "description": "rema", "is_recurring": False},
            {"user_id": user_id, "date":" 2025-07-27", "type": "food", "category": "expense", "amount": 2034, "description": "meny", "is_recurring": False},
            {"user_id": user_id, "date":" 2025-07-15", "type": "loan_payment", "category": "expense", "amount": 15000, "description": "Montly payment", "is_recurring": True},
            {"user_id": user_id, "date":" 2025-07-10", "type": "utilities", "category": "expense", "amount": 500, "description": "power bill", "is_recurring": False},
            {"user_id": user_id, "date":" 2025-07-15", "type": "insurance", "category": "expense", "amount": 500, "description": "car insurance", "is_recurring": True},
            {"user_id": user_id, "date":" 2025-07-01", "type": "salary", "category": "income", "amount": 35000, "description": "job salary", "is_recurring": True},
            {"user_id": user_id, "date":" 2025-07-01", "type": "rent", "category": "income", "amount": 5000, "description": "rent income", "is_recurring": True},
        ]).execute()

    except Exception as e:
        print("error during reset")
        raise HTTPException(status_code=500, detail=str(e))