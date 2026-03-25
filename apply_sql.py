import os
import sys
import django
import subprocess

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

result = subprocess.run(['python', 'manage.py', 'sqlmigrate', 'core', '0001'], capture_output=True, text=True)
if result.returncode != 0:
    print("Error getting sql: ", result.stderr)
    sys.exit(1)

sql = result.stdout

with connection.cursor() as cursor:
    cursor.execute(sql)
    
print("SQL Executed Successfully.")
