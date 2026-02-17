
import os
import django
import sys

sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.scholartrack.settings')
django.setup()

from backend.core.models import School, Student
from django.db.models import Count

print(f"Total Schools: {School.objects.count()}")
for s in School.objects.all():
    print(f" - {s.schoolid}: {s.school}")

print("\n--- Relation Check ---")
# Check what the reverse relationship is
try:
    rel = School._meta.get_field('student')
    print("Found 'student' field/relation on School model")
except Exception as e:
    print(f"Error finding 'student' field: {e}")

try:
    rel = School._meta.get_field('student_set')
    print("Found 'student_set' field/relation on School model")
except Exception as e:
    print(f"Error finding 'student_set' field: {e}")

from django.core.exceptions import FieldError

print("\n--- Query Test ---")
try:
    qs = School.objects.annotate(c=Count('student')).order_by('-c')
    print("Count('student') worked. Results:")
    for s in qs:
        print(f"   {s.school}: {s.c}")
except Exception as e:
    print(f"Count('student') failed: {e}")

try:
    qs = School.objects.annotate(c=Count('student_set')).order_by('-c')
    print("Count('student_set') worked. Results:")
    for s in qs:
        print(f"   {s.school}: {s.c}")
except Exception as e:
    print(f"Count('student_set') failed: {e}")
