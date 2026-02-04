import io
#import xlsxwriter
import openpyxl
import secrets
import re
from .utils import send_activation_email
from django.contrib.auth.hashers import make_password, check_password
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
from django.utils import timezone

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

# --- Attendance API ---
@api_view(["GET", "POST"])
def attendance_list(request):
    if request.method == "GET":
        session_id = request.GET.get("session_id")
        records = Attendance.objects.select_related("studentid", "sessionid", "sessionid__schoolid").all()
        if session_id:
            records = records.filter(sessionid__sessionid=session_id)

        data = [
            {
                "AttendanceID": r.attendanceid,
                "StudentID": r.studentid.studentid,
                "FirstName": r.studentid.firstname,
                "LastName": r.studentid.lastname,
                "SessionID": r.sessionid.sessionid,
                "SessionTitle": r.sessionid.title,
                "School": r.sessionid.schoolid.school if r.sessionid.schoolid else "",
                "Status": r.status,
            }
            for r in records
        ]
        return Response(data)

    elif request.method == "POST":
        data = request.data
        student_id = data.get("StudentID")
        session_id = data.get("SessionID")
        status = data.get("Status")

        if not student_id or not session_id or not status:
            return Response({"error": "StudentID, SessionID and Status are required"}, status=400)

        student = Student.objects.filter(studentid=student_id).first()
        session = Session.objects.filter(sessionid=session_id).first()
        if not student or not session:
            return Response({"error": "Invalid StudentID or SessionID"}, status=400)

        # --- Lock after week ---
        if timezone.now().date() > session.sessiondate + timedelta(days=7):
            return Response({"error": "Attendance cannot be changed after the week of the session"}, status=403)

        attendance = Attendance.objects.filter(studentid=student, sessionid=session).first()
        if attendance:
            attendance.status = status
            attendance.save()
            return Response({"message": "Attendance updated"})
        else:
            Attendance.objects.create(studentid=student, sessionid=session, status=status)
            return Response({"message": "Attendance created"})


# --- Export Attendance ---
@api_view(["GET"])
def export_attendance(request):
    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()
    if not user or user.role != "admin":
        return Response({"error": "Forbidden"}, status=403)

    # Filters
    session_id = request.GET.get("session_id")
    school_id = request.GET.get("school_id")

    records = Attendance.objects.select_related("studentid", "sessionid", "sessionid__schoolid").all()
    if session_id:
        records = records.filter(sessionid__sessionid=session_id)
    if school_id:
        records = records.filter(sessionid__schoolid__schoolid=school_id)

    # Create workbook
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Attendance"

    # Header row
    headers = ["StudentID", "First Name", "Last Name", "SessionID", "Session Title", "School", "Status"]
    ws.append(headers)

    # Data rows
    for r in records:
        ws.append([
            r.studentid.studentid,
            r.studentid.firstname,
            r.studentid.lastname,
            r.sessionid.sessionid,
            r.sessionid.title,
            r.sessionid.schoolid.school if r.sessionid.schoolid else "",
            r.status,
        ])

    # Create response
    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response["Content-Disposition"] = 'attachment; filename="attendance.xlsx"'

    wb.save(response)
    return response


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

# --- Admin Sees existing users and creates new User ---
@api_view(["GET"])
def list_users(request):
    username = request.headers.get("Username")
    admin = User.objects.filter(username=username).first()
    if not admin or admin.role != "admin":
        return Response({"error": "Forbidden"}, status=403)

    users = User.objects.all()
    data = [
        {
            "fullname": u.fullname,
            "username": u.username,   # can be null if not activated
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
        }
        for u in users
    ]
    return Response(data)

@api_view(["POST"])
def admin_create_user(request):
    username = request.headers.get("Username")
    admin = User.objects.filter(username=username).first()

    if not admin or admin.role != "admin":
        return Response({"error": "Forbidden"}, status=403)

    data = request.data

    # Required fields check
    if not data.get("fullname") or not data.get("email"):
        return Response({"error": "Full Name and email are required"}, status=400)

    token = secrets.token_urlsafe(32)

    try:
        # Create user
        user = User(
            fullname=data["fullname"],
            email=data["email"],
            role=data.get("role", "teacher"),
            is_active=False,
            activation_token=token,
            password="",
            createdat=timezone.now()
        )

        user.save()

        # Send activation email safely
        try:
            send_activation_email(user.email, token)
        except Exception as e:
            print("Failed to send email:", e)

        return Response({"message": "User created, activation email sent"})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

# ---Activation endpoint ---
@api_view(["POST"])
def activate_account(request):
    token = request.data.get("token")
    username = request.data.get("username")
    password = request.data.get("password")

    if not token or not username or not password:
        return Response({"error": "Token, username and password are required"}, status=400)

    user = User.objects.filter(activation_token=token).first()
    if not user:
        return Response({"error": "Invalid or expired token"}, status=400)

    # Username must be unique
    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already taken"},
            status=400
        )


    from django.contrib.auth.hashers import make_password
    user.username = username
    user.password = make_password(password)
    user.is_active = True
    user.activation_token = None
    user.save()

    return Response({"message": "Account activated"})

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

        if not user.is_active:
            return Response({"error": "Account not activated"}, status=403)

        if not check_password(password, user.password):
            return Response({"error": "Invalid password"}, status=400)
        
        return Response({
            "message": "Login successful!",
            "username": user.username,
            "fullname": user.fullname or "",
            "email": user.email or "",
            "userid": user.userid,
            "role": getattr(user, "role", "teacher")
        })

