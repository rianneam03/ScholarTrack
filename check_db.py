import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.scholartrack.settings')
django.setup()

def get_columns(table_name):
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table_name}';")
        columns = cursor.fetchall()
        for col in columns:
            print(f"- {col[0]} ({col[1]})")

print("--- STUDENTS TABLE COLUMNS ---")
get_columns('students')
print("--- USERS TABLE COLUMNS ---")
get_columns('users')
