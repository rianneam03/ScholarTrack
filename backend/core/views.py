import openpyxl
from django.http import HttpResponse
from django.contrib.auth.decorators import user_passes_test
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Student, School, Session, Attendance, User
from django.utils import timezone
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.db import models
import re

# --- CSRF token endpoint ---
def csrf(request):
    return JsonResponse({"csrfToken": get_token(request)})

# --- Dashboard data ---
@api_view(['GET'])
def dashboard_data(request):
    total_students = Student.objects.count()
    total_schools = School.objects.count()
    stem_yes = Student.objects.filter(steminterest='Yes').count()
    stem_percent = round((stem_yes / total_students) * 100, 2) if total_students else 0

    today = timezone.now().date()
    upcoming_sessions = Session.objects.filter(
        sessiondate__gte=today,
        sessiondate__lte=today + timedelta(days=7)
    ).count()

    data = {
        "total_students": total_students,
        "total_schools": total_schools,
        "stem_percent": stem_percent,
        "upcoming_sessions": upcoming_sessions
    }
    return Response(data)

# --- Sessions list API ---
@api_view(['GET', 'POST'])
def sessions_list(request):
    if request.method == 'GET':
        sessions = Session.objects.all()
        data = []
        for s in sessions:
            data.append({
                "SessionID": s.sessionid,
                "Title": s.title,
                "SessionDate": s.sessiondate,
                "Description": s.description,
                "SchoolID": s.schoolid.schoolid if s.schoolid else None,
                "SchoolName": s.schoolid.school if s.schoolid else None,
            })
        return Response(data)

    elif request.method == 'POST':
        try:
            data = request.data
            school_obj = None
            if data.get('SchoolID'):
                school_obj = School.objects.filter(
                    schoolid=int(data.get('SchoolID'))
                ).first()
                if not school_obj:
                    return Response({"error": "Invalid SchoolID"}, status=400)

            session = Session.objects.create(
                title=data.get('Title'),
                sessiondate=data.get('SessionDate'),
                description=data.get('Description'),
                schoolid=school_obj
            )

            return Response({
                "message": "Session added successfully!",
                "SessionID": session.sessionid
            })

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)
        
@api_view(['DELETE'])
def session_detail(request, session_id):
    # Only admins can delete
    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()
    if not user or user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)

    try:
        session = Session.objects.get(pk=session_id)
    except Session.DoesNotExist:
        return Response({"error": "Session not found"}, status=404)

    session.delete()
    return Response({"message": f"Session {session_id} deleted successfully!"})

# --- Attendance list API ---
@api_view(['GET', 'POST'])
def attendance_list(request):
    if request.method == 'GET':
        session_id = request.GET.get('session_id')
        attendance_records = Attendance.objects.all()
        if session_id:
            attendance_records = attendance_records.filter(sessionid=session_id)

        data = []
        for a in attendance_records:
            data.append({
                "AttendanceID": a.attendanceid,
                "StudentID": a.studentid.studentid if a.studentid else None,
                "StudentName": f"{a.studentid.firstname} {a.studentid.lastname}" if a.studentid else None,
                "SessionID": a.sessionid.sessionid if a.sessionid else None,
                "SessionTitle": a.sessionid.title if a.sessionid else None,
                "Status": a.status,
            })
        return Response(data)

    elif request.method == 'POST':
        data = request.data
        if not data.get('StudentID'):
            return Response({"error": "StudentID is required."}, status=400)
        if not data.get('SessionID'):
            return Response({"error": "SessionID is required."}, status=400)
        if not data.get('Status'):
            return Response({"error": "Status is required."}, status=400)

        student_obj = Student.objects.filter(studentid=data.get('StudentID')).first()
        if not student_obj:
            return Response({"error": "Invalid StudentID"}, status=400)

        session_obj = Session.objects.filter(sessionid=data.get('SessionID')).first()
        if not session_obj:
            return Response({"error": "Invalid SessionID"}, status=400)

        attendance = Attendance.objects.filter(
            studentid=student_obj,
            sessionid=session_obj
        ).first()

        if attendance:
            attendance.status = data.get('Status')
            attendance.save()
            return Response({"message": "Attendance updated"})
        else:
            Attendance.objects.create(
                studentid=student_obj,
                sessionid=session_obj,
                status=data.get('Status')
            )
            return Response({"message": "Attendance created"})

# --- Students list API ---
@api_view(['GET', 'POST', 'DELETE', 'PATCH'])
def students_list(request):
    if request.method == 'GET':
        school_id = request.GET.get('school_id')
        students = Student.objects.all()
        if school_id:
            students = students.filter(school_id=school_id)

        data = []
        for s in students:
            data.append({
                "StudentID": s.studentid,
                "FirstName": s.firstname,
                "LastName": s.lastname,
                "Grade": s.grade,
                "SchoolID": s.school.schoolid if s.school else None,
                "SchoolName": s.school.school if s.school else None,
                "StudentPhone": s.studentphone,
                "GuardianName": s.guardianname,
                "GuardianPhone": s.guardianphone,
                "Email": s.email,
                "STEMInterest": s.steminterest,
                "EnrollmentDate": s.enrollmentdate,
            })
        return Response(data)

    elif request.method == 'POST':
        data = request.data
        username = request.headers.get("Username")
        current_user = User.objects.filter(username=username).first()
        is_staff = current_user and current_user.role == "teacher"
        is_admin = current_user and current_user.role == "admin"

        student_id = data.get('StudentID')

        student_id = str(student_id).strip()

        # --- StudentID is REQUIRED for everyone ---
        if not student_id:
            return Response(
            {"error": "Student ID is required."},
            status=400
        )

        # --- Digits only ---
        if not student_id.isdigit():
            return Response(
                {"error": "Student ID must contain digits only."},
                status=400
            )
        
        # --- Length check ---
        max_len = Student._meta.get_field("studentid").max_length
        if len(student_id) > max_len:
            return Response(
                {"error": f"Student ID is too long. Maximum allowed is {max_len} digits."},
                status=400
            )

        # --- Uniqueness ---
        if student_id and Student.objects.filter(studentid=student_id).exists():
            return Response({"error": "StudentID already exists."}, status=400)

        school_obj = None
        if data.get('SchoolID'):
            school_obj = School.objects.filter(schoolid=data.get('SchoolID')).first()
            if not school_obj:
                return Response({"error": "Invalid SchoolID"}, status=400)

        student = Student.objects.create(
            studentid=student_id,
            firstname=data.get('FirstName'),
            lastname=data.get('LastName'),
            grade=data.get('Grade'),
            school=school_obj,
            studentphone=data.get('StudentPhone'),
            guardianname=data.get('GuardianName'),
            guardianphone=data.get('GuardianPhone'),
            email=data.get('Email'),
            steminterest=data.get('STEMInterest'),
            enrollmentdate=data.get('EnrollmentDate')
        )

        return Response({"message": "Student added successfully!", "StudentID": student.studentid})

    elif request.method == 'DELETE':
        try:
            username = request.headers.get("Username")
            user = User.objects.filter(username=username).first()
            if not user or user.role != "admin":
                return Response({"error": "Unauthorized"}, status=403)

            student_id = request.GET.get("StudentID")
            if not student_id:
                return Response({"error": "StudentID missing"}, status=400)

            student = Student.objects.filter(studentid=student_id).first()
            if not student:
                return Response({"error": "Student not found"}, status=404)

            student.delete()
            return Response({"message": f"Student {student_id} deleted successfully!"})

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)
    elif request.method == "PATCH":
        data = request.data
        student_id = data.get("StudentID")
        username = request.headers.get("Username")

        if not student_id:
            return Response({"error": "StudentID required"}, status=400)

        user = User.objects.filter(username=username).first()
        if not user:
            return Response({"error": "Unauthorized"}, status=403)

        try:
            student = Student.objects.get(studentid=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)

        # Fields both admin & staff can update
        student.firstname = data.get("FirstName", student.firstname)
        student.lastname = data.get("LastName", student.lastname)
        student.grade = data.get("Grade", student.grade)
        student.steminterest = data.get("STEMInterest", student.steminterest)
        student.enrollmentdate = data.get("EnrollmentDate", student.enrollmentdate)

        # School update
        if data.get("SchoolID"):
            school = School.objects.filter(schoolid=data.get("SchoolID")).first()
            if school:
                student.school = school

        # Admin-only fields
        if user.role == "admin":
            student.studentphone = data.get("StudentPhone", student.studentphone)
            student.guardianname = data.get("GuardianName", student.guardianname)
            student.guardianphone = data.get("GuardianPhone", student.guardianphone)
            student.email = data.get("Email", student.email)

        student.save()
        return Response({"message": "Student updated successfully"})
    
#Export list
@api_view(["GET"])
def export_students_excel(request):
    # 🔐 Admin-only check (matches your app logic)
    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()

    if not user or user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)

    students = Student.objects.select_related("school").all()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Students"

    # Header row
    headers = [
        "StudentID",
        "First Name",
        "Last Name",
        "Grade",
        "School",
        "STEM Interest",
        "Enrollment Date",
        "Student Phone",
        "Guardian Name",
        "Guardian Phone",
        "Email",
    ]
    ws.append(headers)

    # Data rows
    for s in students:
        ws.append([
            s.studentid,
            s.firstname,
            s.lastname,
            s.grade,
            s.school.school if s.school else "",
            s.steminterest,
            s.enrollmentdate.strftime("%Y-%m-%d") if s.enrollmentdate else "",
            s.studentphone,
            s.guardianname,
            s.guardianphone,
            s.email,
        ])

    # Create response
    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response["Content-Disposition"] = 'attachment; filename="students.xlsx"'

    wb.save(response)
    return response


# --- Schools list API ---
@api_view(['GET', 'POST'])
def schools_list(request):
    if request.method == 'GET':
        schools = School.objects.all()
        data = [{"SchoolID": s.schoolid, "SchoolName": s.school} for s in schools]
        return Response(data)

    elif request.method == 'POST':
        data = request.data
        if not data.get('SchoolName'):
            return Response({"error": "SchoolName is required."}, status=400)

        school = School.objects.create(school=data.get('SchoolName'))
        return Response({"message": "School added successfully!", "SchoolID": school.schoolid})

# --- Students by school ---
@api_view(['GET'])
def students_by_school(request, school_id):
    students = Student.objects.filter(schoolid=school_id)
    data = [
        {"StudentID": s.studentid, "FirstName": s.firstname, "LastName": s.lastname, "Grade": s.grade}
        for s in students
    ]
    return Response(data)

# --- Login ---
@csrf_exempt
@api_view(['GET', 'POST', 'OPTIONS'])
def login_user(request):
    if request.method == "OPTIONS":
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "https://scholartrack-frontend.onrender.com"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        response["Access-Control-Allow-Credentials"] = "true"
        return response

    if request.method == "GET":
        return Response({"message": "Login endpoint is live"}, status=200)

    if request.method == "POST":
        username = request.data.get("username")
        password = request.data.get("password")

        user = User.objects.filter(username=username).first()
        if not user:
            return Response({"error": "User not found"}, status=404)

        if password != user.password:
            return Response({"error": "Invalid password"}, status=400)

        return Response({
            "message": "Login successful!",
            "username": user.username,
            "fullname": user.fullname or "",
            "email": user.email or "",
            "userid": user.userid,
            "role": getattr(user, "role", "teacher")
        })

