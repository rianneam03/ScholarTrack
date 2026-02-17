
import os
import django
import sys

sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.scholartrack.settings')
django.setup()

from backend.core.models import School, Student
from django.db.models import Count

print("--- All Schools ---")
schools = School.objects.all()
for s in schools:
    print(f"ID: {s.schoolid}, Name: '{s.school}'")

print("\n--- Annotation Test ---")
try:
    # Testing the exact query used in views.py
    schools_qs = School.objects.annotate(count=Count('student')).order_by('-count')
    for s in schools_qs:
        print(f"Name: '{s.school}', Count: {s.count}")
except Exception as e:
    print(f"Error in annotation: {e}")

print("\n--- Try Count('student_set') ---")
try:
    schools_qs_2 = School.objects.annotate(count=Count('student_set')).order_by('-count')
    for s in schools_qs_2:
        print(f"Name: '{s.school}', Count: {s.count}")
except Exception as e:
    print(f"Error in student_set: {e}")
