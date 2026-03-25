import subprocess

with open('migrate_out.txt', 'w', encoding='utf-8') as f:
    result = subprocess.run(['python', 'manage.py', 'migrate'], capture_output=True, text=True)
    f.write("STDOUT:\n")
    f.write(result.stdout)
    f.write("\nSTDERR:\n")
    f.write(result.stderr)
