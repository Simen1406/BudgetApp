import pandas as pd
import os
import io


#Columns to remove
SENSITIVE_FIELDS = ['Bokført dato', 'Rentedato', 'Beskrivelse', 'Fra konto', 'Avsender', 'Til konto', 'Mottakernavn', 'Valuta', 'Status', 'Melding/KID/Fakt.nr']

#function to remove unneccecary columns and rows. 
def clean_bank_statement(input_path: str, output_path: str):
    df = pd.read_csv(input_path, encoding="latin1", delimiter=";")

    #Drops any columns listed in SENSITIVE_FIELDS if they exist in the file
    df = df.drop(columns=[col for col in SENSITIVE_FIELDS if col in df.columns], errors='ignore')

    
    #Change from norwegian to english column names
    df.rename(columns={'Utført dato': 'date', 'Beløp ut': 'expense', 'Type' : 'type', 'Beløp inn' : 'income'}, inplace=True)
    df.dropna(subset=['date'], inplace=True)

    #adds the category column 
    if 'category' not in df.columns:
        df['category'] = df["type"]

    #adds together all the amounts from money out column
    df["expense"] = pd.to_numeric(df["expense"],errors="coerce").fillna(0)
    df['income'] = pd.to_numeric(df.get('income', 0), errors='coerce').fillna(0)

    #create a column for amount
    df["amount"] = df[["income", "expense"]].max(axis=1)

    #assign category type for each row depending on value of expense and income
    df["category"] = df["income"].gt(0).map({True: "income", False: "expense"})

    df['date'] = pd.to_datetime(df['date'], format='%d.%m.%Y', errors='coerce').dt.strftime('%Y-%m-%d')
    df.dropna(subset=['date'], inplace=True)
       
     # Reorder columns explicitly to match supabase transactions table
    df = df[['date', 'type', 'category', 'amount']]

    # Ensures that output folder exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)





"""#this parts need to be edited to automatically match input file and create correct output filename. for now its ok for testing.
months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
months_year_csv = []
year = "2025"

for month in months:
    months_year_csv.append(month + year + ".csv")

full_output_path = "data/cleaned/cleaned" + months_year_csv[3]
full_input_path = "data/raw/" + months_year_csv[3]"""


partial_input_path = "data/raw/"
partial_output_path = "data/cleaned/"
csv_path = ".csv"

if __name__ == "__main__":
    clean_bank_statement(
        input_path = partial_input_path + "april2025raw" + csv_path,
        output_path = partial_output_path + "april2025cleaned" + csv_path
    )


def clean_bank_statement_df(df: pd.DataFrame) -> pd.DataFrame:
    SENSITIVE_FIELDS = [
        'Bokført dato', 'Rentedato', 'Beskrivelse', 'Fra konto', 'Avsender',
        'Til konto', 'Mottakernavn', 'Valuta', 'Status', 'Melding/KID/Fakt.nr'
    ]

    df = df.copy()
    df = df.drop(columns=[col for col in SENSITIVE_FIELDS if col in df.columns], errors='ignore')

    df.rename(columns={
        'Utført dato': 'date',
        'Beløp ut': 'expense',
        'Beløp inn': 'income',
        'Type': 'type'
    }, inplace=True)

    df.dropna(subset=['date'], inplace=True)

    df["expense"] = pd.to_numeric(df["expense"], errors="coerce").fillna(0)
    df["income"] = pd.to_numeric(df["income"], errors="coerce").fillna(0)

    df["category"] = df["income"].gt(0).map({True: "income", False: "expense"})
    df["amount"] = df.apply(
        lambda row: row["income"] if row["category"] == "income" else abs(row["expense"]),
        axis=1
    )



    df['date'] = pd.to_datetime(df['date'], format='%d.%m.%Y', errors='coerce').dt.strftime('%Y-%m-%d')
    df.dropna(subset=['date'], inplace=True)

    return df[['date', 'type', 'category', 'amount']]