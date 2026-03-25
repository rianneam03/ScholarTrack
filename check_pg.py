import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('backend/.env')

with open("pg_columns.txt", "w") as f:
    try:
        conn = psycopg2.connect(
            dbname=os.environ.get('DB_NAME'),
            user=os.environ.get('DB_USER'),
            password=os.environ.get('DB_PASSWORD'),
            host=os.environ.get('DB_HOST'),
            port=os.environ.get('DB_PORT')
        )
        cursor = conn.cursor()
        cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';")
        columns = cursor.fetchall()
        f.write("--- USERS TABLE COLUMNS ---\n")
        for col in columns:
            f.write(f"- {col[0]} ({col[1]})\n")
        
        cursor.close()
        conn.close()
    except Exception as e:
        f.write("Error: " + str(e) + "\n")
