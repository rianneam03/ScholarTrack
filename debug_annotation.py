
import os
import django
import sys

sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.scholartrack.settings')
django.setup()

from backend.core.models import School
from django.db.models import Count

print("--- START DEBUG ---")

print("\n--- TEST 1: Count('student') ---")
try:
    schools_qs = School.objects.annotate(count=Count('student')).order_by('-count')
    # Force evaluation
    count = schools_qs.count()
    print(f"Success! Found {count} schools.")
    for s in schools_qs:
        print(f"School: '{s.school}' | Count: {s.count}")
except Exception as e:
    print(f"FAILED: {e}")

print("\n--- TEST 2: Count('student_set') ---")
try:
    schools_qs = School.objects.annotate(count=Count('student_set')).order_by('-count')
    # Force evaluation
    count = schools_qs.count()
    print(f"Success! Found {count} schools.")
    for s in schools_qs:
        print(f"School: '{s.school}' | Count: {s.count}")
except Exception as e:
    print(f"FAILED: {e}")

print("--- END DEBUG ---")
