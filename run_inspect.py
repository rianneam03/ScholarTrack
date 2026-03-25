import subprocess

with open('inspect_out.txt', 'w') as f:
    result = subprocess.run(['python', 'manage.py', 'inspectdb'], capture_output=True, text=True)
    f.write("STDOUT:\n")
    f.write(result.stdout)
    f.write("\nSTDERR:\n")
    f.write(result.stderr)
