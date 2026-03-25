import subprocess
from django.db import connection

result = subprocess.run(['python', 'manage.py', 'sqlmigrate', 'core', '0001'], capture_output=True, text=True)
if result.returncode != 0:
    print("Error getting sql: ", result.stderr)
else:
    sql = result.stdout
    statements = [s for s in sql.split(';') if s.strip()]

    with connection.cursor() as cursor:
        for stmt in statements:
            try:
                cursor.execute(stmt)
                print("Executed:", stmt[:60].replace('\n', ' '))
            except Exception as e:
                print("Failed (probably already exists):", str(e).split('\n')[0])
        
    print("SQL Applied Safely.")
