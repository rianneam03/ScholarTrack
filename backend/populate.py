import os
import django
from datetime import date, datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Student, Program, ProgramYear, Session, Enrollment, Attendance

def populate():
    print("Starting database population...")

    # Create Users
    admin, _ = User.objects.get_or_create(username='admin_test', defaults={
        'fullname': 'Admin Test User',
        'email': 'admin@scholartrack.org',
        'role': 'Administrator',
        'password': 'hashed_password_placeholder',
        'is_active': True
    })
    
    instructor, _ = User.objects.get_or_create(username='instructor_test', defaults={
        'fullname': 'Instructor Test User',
        'email': 'instructor@scholartrack.org',
        'role': 'Instructor',
        'password': 'hashed_password_placeholder',
        'is_active': True
    })
    print("Users created.")

    # Create Programs
    program1, _ = Program.objects.get_or_create(name='STEM Summer Camp', defaults={
        'description': 'A rigorous summer camp focusing on science and technology.'
    })
    
    program2, _ = Program.objects.get_or_create(name='After School Coding', defaults={
        'description': 'Weekly coding sessions for high schoolers.'
    })
    print("Programs created.")

    # Create Program Years
    py1, _ = ProgramYear.objects.get_or_create(program=program1, year=2026, defaults={
        'start_date': date(2026, 6, 1),
        'end_date': date(2026, 8, 30)
    })
    
    py2, _ = ProgramYear.objects.get_or_create(program=program2, year=2026, defaults={
        'start_date': date(2026, 9, 1),
        'end_date': date(2026, 12, 15)
    })
    print("Program Years created.")

    # Create Students
    student1, _ = Student.objects.get_or_create(studentid='ST0001', defaults={
        'firstname': 'Alice',
        'lastname': 'Smith',
        'grade': '10th',
        'steminterest': 'High',
        'enrollmentdate': date(2026, 1, 15),
        'email': 'alice@example.com'
    })
    
    student2, _ = Student.objects.get_or_create(studentid='ST0002', defaults={
        'firstname': 'Bob',
        'lastname': 'Jones',
        'grade': '11th',
        'steminterest': 'Medium',
        'enrollmentdate': date(2026, 2, 20),
        'email': 'bob@example.com'
    })

    student3, _ = Student.objects.get_or_create(studentid='ST0003', defaults={
        'firstname': 'Charlie',
        'lastname': 'Brown',
        'grade': '9th',
        'steminterest': 'Low',
        'enrollmentdate': date(2026, 3, 10),
        'email': 'charlie@example.com'
    })
    print("Students created.")

    # Create Enrollments
    e1, _ = Enrollment.objects.get_or_create(student=student1, program_year=py1, defaults={
        'enrollment_date': date(2026, 5, 10),
        'status': 'Enrolled'
    })
    
    e2, _ = Enrollment.objects.get_or_create(student=student2, program_year=py1, defaults={
        'enrollment_date': date(2026, 5, 11),
        'status': 'Enrolled'
    })

    e3, _ = Enrollment.objects.get_or_create(student=student3, program_year=py2, defaults={
        'enrollment_date': date(2026, 8, 10),
        'status': 'Enrolled'
    })
    print("Enrollments created.")

    # Create Sessions
    session1, _ = Session.objects.get_or_create(title='Intro to Robotics', program_year=py1, sessiondate=date(2026, 6, 5), defaults={
        'description': 'First day of robotics lab.'
    })
    
    session2, _ = Session.objects.get_or_create(title='Python Basics', program_year=py2, sessiondate=date(2026, 9, 5), defaults={
        'description': 'Variables and data types.'
    })
    print("Sessions created.")

    # Create Attendance
    Attendance.objects.get_or_create(session=session1, enrollment=e1, defaults={
        'status': 'Present'
    })
    Attendance.objects.get_or_create(session=session1, enrollment=e2, defaults={
        'status': 'Absent',
        'notes': 'Doctor appointment'
    })
    Attendance.objects.get_or_create(session=session2, enrollment=e3, defaults={
        'status': 'Present'
    })
    print("Attendance records created.")
    
    print("Database successfully populated with sample data!")

if __name__ == '__main__':
    populate()
