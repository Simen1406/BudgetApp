import pandas as pd
import os


#Columns to remove
SENSITIVE_FIELDS = ['Bokført dato', 'Rentedato', 'Undertype', 'Fra konto', 'Avsender', 'Til konto', 'Mottakernavn', 'Valuta', 'Status', 'Melding/KID/Fakt.nr', 'Beskrivelse']

#function to remove unneccecary columns and rows. 
def clean_bank_statement(input_path: str, output_path: str):
    df = pd.read_csv(input_path, encoding="latin1", delimiter=";")

    #Drops any columns listed in SENSITIVE_FIELDS if they exist in the file
    df = df.drop(columns=[col for col in SENSITIVE_FIELDS if col in df.columns], errors='ignore')

    
    #Change from norwegian to english column names
    df.rename(columns={'Utført dato': 'date', 'Beløp ut': 'money out', 'Type' : 'type', }, inplace=True)
    df.dropna(subset=['date', 'money out'], inplace=True)

    #adds the category column 
    if 'category' not in df.columns:
        df['category'] = df["type"]

    #adds together all the amounts from money out column
    df["money out"] = pd.to_numeric(df["money out"],errors="coerce")
    total_money_out = df["money out"].sum()

    #creates a new row for the total sum
    total_row = pd.DataFrame([{
        "date": "Money out this month",
        "money out": total_money_out,
        "type" : "Total"
        }])
    df = pd.concat([df, total_row], ignore_index=True)

    #Ensures the output directory (data/cleaned/) exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Cleaned file saved to: {output_path}")


if __name__ == "__main__":
    clean_bank_statement(
        input_path="data/raw/jan_mai2025.csv",
        output_path="data/cleaned/cleaned_jan_mai2025.csv"
    )