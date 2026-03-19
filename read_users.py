import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.scholartrack.settings')
django.setup()

from backend.core.models import User

with open("output.txt", "w") as f:
    f.write("---- USERS ----\n")
    for u in User.objects.all():
        f.write(f"User: {u.username} | PWD: {str(u.password)[:15]}... | Active: {u.is_active} | Role: {u.role}\n")
    f.write("---- END ----\n")
