import openpyxl
import secrets
from datetime import date
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password

from .models import Student, School, Session, Attendance, User, Need, Program, ProgramYear, ProgramStaff, Enrollment, Outcome, Survey, SurveyResponse, Guardian
from .serializers import SchoolSerializer, NeedSerializer, ProgramSerializer, ProgramYearSerializer, ProgramStaffSerializer, EnrollmentSerializer, OutcomeSerializer, SurveySerializer, SurveyResponseSerializer
from .utils import send_activation_email

# --- CSRF token endpoint ---
def csrf(request):
    return JsonResponse({"csrfToken": get_token(request)})

# --- Dashboard data ---
@api_view(['GET'])
def dashboard_data(request):
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    students_qs = Student.objects.all()
    sessions_qs = Session.objects.all()

    if start_date_str:
        sessions_qs = sessions_qs.filter(sessiondate__gte=start_date_str)
        students_qs = students_qs.filter(enrollmentdate__gte=start_date_str)
    if end_date_str:
        sessions_qs = sessions_qs.filter(sessiondate__lte=end_date_str)
        students_qs = students_qs.filter(enrollmentdate__lte=end_date_str)

    total_students = students_qs.count()
    total_schools = School.objects.count()
    stem_yes = students_qs.filter(steminterest='Yes').count()
    stem_percent = round((stem_yes / total_students) * 100, 2) if total_students else 0

    today = timezone.now().date()
    
    total_sessions_conducted = sessions_qs.filter(sessiondate__lt=today).count()
    total_sessions_upcoming = sessions_qs.filter(sessiondate__gte=today).count()

    attendance_qs = Attendance.objects.filter(session__in=sessions_qs)
    total_attendance_records = attendance_qs.count()
    total_present = attendance_qs.filter(status__iexact='Present').count()
    attendance_rate = round((total_present / total_attendance_records) * 100, 1) if total_attendance_records else 0
    avg_attendance = round(total_present / total_sessions_conducted, 1) if total_sessions_conducted else 0

    # Calculate Total Service Hours (assume 2 hours per session for now)
    total_service_hours = total_present * 2

    # Students by Grade
    grades_qs = students_qs.values('grade').annotate(count=Count('grade')).order_by('grade')
    students_by_grade = [{"name": item['grade'] or "Unknown", "value": item['count']} for item in grades_qs]

    # Students by School
    schools_qs = School.objects.all()
    students_by_school = [{"name": item.school or "Unknown", "value": students_qs.filter(school=item).count()} for item in schools_qs if students_qs.filter(school=item).exists()]
    students_by_school.sort(key=lambda x: x['value'], reverse=True)

    # Student growth over time
    growth_qs = students_qs.filter(enrollmentdate__isnull=False)\
        .annotate(month=TruncMonth('enrollmentdate'))\
        .values('month')\
        .annotate(count=Count('studentid'))\
        .order_by('month')
    
    student_growth = []
    for item in growth_qs:
        month_val = item['month']
        if isinstance(month_val, str):
            name_val = month_val[:7]  # 'YYYY-MM-DD' -> 'YYYY-MM'
        else:
            name_val = month_val.strftime("%Y-%m") if month_val else "Unknown"
        student_growth.append({"name": name_val, "value": item['count']})

    stem_no_count = total_students - stem_yes
    stem_data = [{"name": "STEM Interest", "value": stem_yes}, {"name": "Other", "value": stem_no_count}]

    total_staff = User.objects.filter(role__in=['admin', 'teacher']).count()
    active_programs = ProgramYear.objects.count()

    data = {
        "total_students": total_students,
        "total_schools": total_schools,
        "total_staff": total_staff,
        "active_programs": active_programs,
        "stem_percent": stem_percent,
        "upcoming_sessions": total_sessions_upcoming,
        "sessions_conducted": total_sessions_conducted,
        "attendance_rate": attendance_rate,
        "avg_attendance": avg_attendance,
        "total_service_hours": total_service_hours,
        "students_by_grade": students_by_grade,
        "students_by_school": students_by_school,
        "student_growth": student_growth,
        "stem_data": stem_data
    }
    return Response(data)

# --- Sessions list API ---
@api_view(['GET', 'POST'])
def sessions_list(request):
    if request.method == 'GET':
        username = request.headers.get("Username")
        user = User.objects.filter(username=username).first()
        sessions = Session.objects.select_related('program_year__program').all()
        
        if user and user.role == "teacher":
            assigned_py_ids = ProgramStaff.objects.filter(user=user).values_list('program_year_id', flat=True)
            sessions = sessions.filter(program_year_id__in=assigned_py_ids)
            
        data = []
        for s in sessions:
            data.append({
                "SessionID": s.sessionid,
                "Title": s.title,
                "SessionDate": s.sessiondate,
                "Description": s.description,
                "ProgramYearID": s.program_year.program_year_id if s.program_year else None,
                "ProgramName": s.program_year.program.name if s.program_year and s.program_year.program else None,
            })
        return Response(data)

    elif request.method == 'POST':
        try:
            data = request.data
            program_year_obj = None
            if data.get('ProgramYearID'):
                program_year_obj = ProgramYear.objects.filter(pk=int(data.get('ProgramYearID'))).first()
                if not program_year_obj:
                    return Response({"error": "Invalid ProgramYearID"}, status=400)
            session = Session.objects.create(
                title=data.get('Title'),
                sessiondate=data.get('SessionDate'),
                description=data.get('Description'),
                program_year=program_year_obj
            )
            return Response({"message": "Session added successfully!", "SessionID": session.sessionid})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)

@api_view(['DELETE'])
def session_detail(request, session_id):
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
        attendance_records = Attendance.objects.select_related('enrollment__student', 'session').all()
        if session_id:
            attendance_records = attendance_records.filter(session__sessionid=session_id)
        data = []
        for a in attendance_records:
            student = a.enrollment.student if a.enrollment and a.enrollment.student else None
            data.append({
                "AttendanceID": a.attendanceid,
                "StudentID": student.studentid if student else None,
                "StudentName": f"{student.firstname} {student.lastname}" if student else None,
                "SessionID": a.session.sessionid if a.session else None,
                "SessionTitle": a.session.title if a.session else None,
                "Status": a.status,
            })
        return Response(data)

    elif request.method == 'POST':
        data = request.data
        if not data.get('StudentID') or not data.get('SessionID') or not data.get('Status'):
            return Response({"error": "StudentID, SessionID, and Status are required."}, status=400)

        session_obj = Session.objects.select_related('program_year').filter(sessionid=data.get('SessionID')).first()
        if not session_obj:
            return Response({"error": "Invalid SessionID"}, status=400)

        enrollment = Enrollment.objects.filter(student_id=data.get('StudentID'), program_year=session_obj.program_year).first()
        if not enrollment:
            return Response({"error": "Student is not enrolled in this session's program year"}, status=400)

        attendance = Attendance.objects.filter(enrollment=enrollment, session=session_obj).first()
        
        # --- Role Check for Editing ---
        username = request.headers.get("Username")
        user = User.objects.filter(username=username).first()
        
        if attendance:
            # Creation vs Update logic: 
            # Both Admin and assigned Teacher can update.
            if user.role == "teacher":
                is_assigned = ProgramStaff.objects.filter(user=user, program_year=session_obj.program_year).exists()
                if not is_assigned:
                    return Response({"error": "You are not assigned to this program and cannot edit records."}, status=403)
            
            attendance.status = data.get('Status')
            attendance.save()
            return Response({"message": "Attendance updated"})
        else:
            # Creation is allowed for both, but for Teacher, ensure they are assigned.
            if user.role == "teacher":
                is_assigned = ProgramStaff.objects.filter(user=user, program_year=session_obj.program_year).exists()
                if not is_assigned:
                    return Response({"error": "You are not assigned to this program."}, status=403)
            
            Attendance.objects.create(enrollment=enrollment, session=session_obj, status=data.get('Status'))
            return Response({"message": "Attendance marked successfully"})

@api_view(["GET"])
def export_attendance(request):
    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()
    if not user or user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)
    session_id = request.GET.get("session_id")
    if not session_id:
        return Response({"error": "session_id is required"}, status=400)

    attendance = Attendance.objects.select_related("enrollment__student", "session", "session__program_year__program").filter(session__sessionid=session_id)
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Attendance"
    headers = ["Student ID", "First Name", "Last Name", "Program", "Session Title", "Session Date", "Status"]
    ws.append(headers)
    for a in attendance:
        student = a.enrollment.student if a.enrollment and a.enrollment.student else None
        program_name = a.session.program_year.program.name if a.session and a.session.program_year and hasattr(a.session.program_year, 'program') else ""
        ws.append([
            student.studentid if student else "",
            student.firstname if student else "",
            student.lastname if student else "",
            program_name,
            a.session.title if a.session else "",
            a.session.sessiondate.strftime("%Y-%m-%d") if a.session and a.session.sessiondate else "",
            a.status,
        ])
    response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
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
        data = [{"StudentID": s.studentid,"FirstName": s.firstname,"LastName": s.lastname,"Grade": s.grade,
                 "SchoolID": s.school.schoolid if s.school else None,"SchoolName": s.school.school if s.school else None,
                 "StudentPhone": s.studentphone,"GuardianName": s.guardianname,"GuardianPhone": s.guardianphone,
                 "Email": s.email,"STEMInterest": s.steminterest,"EnrollmentDate": s.enrollmentdate} for s in students]
        return Response(data)

    elif request.method == 'POST':
        data = request.data
        username = request.headers.get("Username")
        current_user = User.objects.filter(username=username).first()
        student_id = str(data.get('StudentID')).strip()
        if not student_id: return Response({"error": "Student ID is required."}, status=400)
        if not student_id.isdigit(): return Response({"error": "Student ID must contain digits only."}, status=400)
        max_len = Student._meta.get_field("studentid").max_length
        if len(student_id) > max_len: return Response({"error": f"Student ID too long. Max {max_len} digits."}, status=400)
        if Student.objects.filter(studentid=student_id).exists(): return Response({"error": "StudentID exists."}, status=400)
        enrollment_date = data.get('EnrollmentDate') or date.today()
        school_obj = School.objects.filter(schoolid=data.get("SchoolID")).first()
        if not school_obj: return Response({"error": "Invalid SchoolID"}, status=400)
        student = Student.objects.create(
            studentid=student_id, firstname=data.get('FirstName'), lastname=data.get('LastName'),
            grade=data.get('Grade'), school=school_obj, studentphone=data.get('StudentPhone'),
            guardianname=data.get('GuardianName'), guardianphone=data.get('GuardianPhone'),
            email=data.get('Email'), steminterest=data.get('STEMInterest'), enrollmentdate=enrollment_date
        )
        return Response({"message": "Student added successfully!", "StudentID": student.studentid})

    elif request.method == 'DELETE':
        username = request.headers.get("Username")
        user = User.objects.filter(username=username).first()
        if not user or user.role != "admin": return Response({"error": "Unauthorized"}, status=403)
        student_id = request.GET.get("StudentID")
        student = Student.objects.filter(studentid=student_id).first()
        if not student: return Response({"error": "Student not found"}, status=404)
        student.delete()
        return Response({"message": f"Student {student_id} deleted successfully!"})

    elif request.method == "PATCH":
        data = request.data
        student_id = data.get("StudentID")
        username = request.headers.get("Username")
        user = User.objects.filter(username=username).first()
        if not student_id: return Response({"error": "StudentID required"}, status=400)
        if not user: return Response({"error": "Unauthorized"}, status=403)
        try: student = Student.objects.get(studentid=student_id)
        except Student.DoesNotExist: return Response({"error": "Student not found"}, status=404)
        student.firstname = data.get("FirstName", student.firstname)
        student.lastname = data.get("LastName", student.lastname)
        student.grade = data.get("Grade", student.grade)
        student.steminterest = data.get("STEMInterest", student.steminterest)
        student.enrollmentdate = data.get("EnrollmentDate", student.enrollmentdate)
        if data.get("SchoolID"):
            school = School.objects.filter(schoolid=data.get("SchoolID")).first()
            if school: student.school = school
        if user.role == "admin":
            student.studentphone = data.get("StudentPhone", student.studentphone)
            student.guardianname = data.get("GuardianName", student.guardianname)
            student.guardianphone = data.get("GuardianPhone", student.guardianphone)
            student.email = data.get("Email", student.email)
        student.save()
        return Response({"message": "Student updated successfully"})

# Export students
@api_view(["GET"])
def export_students_excel(request):
    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()
    if not user or user.role != "admin": return Response({"error": "Unauthorized"}, status=403)
    students = Student.objects.select_related("school").all()
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Students"
    headers = ["StudentID","First Name","Last Name","Grade","School","STEM Interest","Enrollment Date","Student Phone","Guardian Name","Guardian Phone","Email"]
    ws.append(headers)
    for s in students:
        ws.append([
            s.studentid, s.firstname, s.lastname, s.grade, s.school.school if s.school else "",
            s.steminterest, s.enrollmentdate.strftime("%Y-%m-%d") if s.enrollmentdate else "",
            s.studentphone, s.guardianname, s.guardianphone, s.email
        ])
    response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response["Content-Disposition"] = 'attachment; filename="students.xlsx"'
    wb.save(response)
    return response

# --- Schools list API --- 
@api_view(["GET", "POST"]) 
def schools_list(request): 
    if request.method == "GET":
        try:
            schools = School.objects.annotate(student_count=Count('student', distinct=True)).order_by('school')
            data = [{"SchoolID": s.schoolid, "SchoolName": s.school,"StudentCount": s.student_count,"SessionCount": 0} for s in schools]
        except Exception:
            import traceback
            traceback.print_exc()
            schools = School.objects.all().order_by('school')
            data = [{"SchoolID": s.schoolid,"SchoolName": s.school,"StudentCount": Student.objects.filter(school=s).count(),"SessionCount": 0} for s in schools]
        return Response(data) 
    if request.method == "POST": 
        school_name = request.data.get("SchoolName") 
        if not school_name: return Response({"error": "SchoolName is required"}, status=400) 
        try: 
            school = School.objects.create(school=school_name.strip()) 
            return Response({"SchoolID": school.schoolid,"SchoolName": school.school}, status=201) 
        except Exception as e: 
            import traceback 
            traceback.print_exc() 
            return Response({"error": str(e)}, status=500)

# --- Students by school ---
@api_view(['GET'])
def students_by_school(request, school_id):
    students = Student.objects.filter(schoolid=school_id)
    data = [{"StudentID": s.studentid, "FirstName": s.firstname, "LastName": s.lastname, "Grade": s.grade} for s in students]
    return Response(data)

# --- Users ---
@api_view(["GET"])
def list_users(request):
    username = request.headers.get("Username")
    admin = User.objects.filter(username=username).first()
    if not admin or admin.role != "admin":
        return Response({"error": "Forbidden"}, status=403)
    users = User.objects.all()
    data = [{"userid": u.userid, "fullname": u.fullname,"username": u.username,"email": u.email,"role": u.role,"is_active": u.is_active} for u in users]
    return Response(data)

@api_view(["POST"])
def admin_create_user(request):
    username = request.headers.get("Username")
    admin = User.objects.filter(username=username).first()
    if not admin or admin.role != "admin":
        return Response({"error": "Forbidden"}, status=403)
    data = request.data
    if not data.get("fullname") or not data.get("email"):
        return Response({"error": "Full Name and email are required"}, status=400)
    token = secrets.token_urlsafe(32)
    try:
        frontend_url = request.data.get("frontend_url", "https://scholartrack-frontend.onrender.com")
        user = User(fullname=data["fullname"],email=data["email"],role=data.get("role","teacher"),is_active=False,activation_token=token,password="",createdat=timezone.now())
        user.save()

        # --- Guardian Sync ---
        if data.get("role") == "parent":
            guardian = Guardian.objects.filter(email=data["email"]).first()
            if not guardian:
                Guardian.objects.create(name=data["fullname"], email=data["email"])

        try: send_activation_email(user.email, token, frontend_url)
        except Exception as e: print("Failed to send email:", e)
        return Response({"message": "User created, activation email sent"})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

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
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=400)
    user.username = username
    user.password = make_password(password)
    user.is_active = True
    user.activation_token = None
    user.save()
    return Response({"message": "Account activated"})

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
        if not user or not check_password(password, user.password):
            return Response({"error": "Invalid username or password"}, status=401)
        return Response({"username": user.username,"role": user.role,"fullname": user.fullname,"email": user.email})

# --- Needs ---
@api_view(['GET', 'POST'])
def needs_list(request):
    if request.method == 'GET':
        needs = Need.objects.all()
        serializer = NeedSerializer(needs, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        username = request.headers.get("Username")
        user = User.objects.filter(username=username).first()
        if not user or user.role not in ["admin", "teacher"]:
            return Response({"error": "Unauthorized"}, status=403)
        serializer = NeedSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def need_detail(request, need_id):
    try:
        need = Need.objects.get(pk=need_id)
    except Need.DoesNotExist:
        return Response({"error": "Need not found"}, status=404)

    if request.method == 'GET':
        serializer = NeedSerializer(need)
        return Response(serializer.data)

    # Check permissions for edit/delete
    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()
    if not user or user.role not in ["admin", "teacher"]:
        return Response({"error": "Unauthorized"}, status=403)

    if request.method == 'PUT':
        serializer = NeedSerializer(need, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        need.delete()
        return Response({"message": "Need deleted successfully"})

# --- Programs ---
@api_view(['GET', 'POST'])
def programs_list(request):
    if request.method == 'GET':
        programs = Program.objects.all()
        serializer = ProgramSerializer(programs, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        username = request.headers.get("Username")
        user = User.objects.filter(username=username).first()
        if not user or user.role != "admin":
            return Response({"error": "Admin access required"}, status=403)
        serializer = ProgramSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def program_detail(request, program_id):
    try:
        program = Program.objects.get(pk=program_id)
    except Program.DoesNotExist:
        return Response({"error": "Program not found"}, status=404)
    if request.method == 'GET':
        serializer = ProgramSerializer(program)
        return Response(serializer.data)
    
    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()
    if not user or user.role != "admin":
        return Response({"error": "Admin access required"}, status=403)
        
    if request.method == 'PUT':
        serializer = ProgramSerializer(program, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        program.delete()
        return Response({"message": "Program deleted successfully"})

# --- Program Years ---
@api_view(['GET', 'POST'])
def program_years_list(request):
    if request.method == 'GET':
        years = ProgramYear.objects.select_related('program').all()
        serializer = ProgramYearSerializer(years, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        username = request.headers.get("Username")
        user = User.objects.filter(username=username).first()
        if not user or user.role != "admin":
            return Response({"error": "Admin access required"}, status=403)
        
        data = request.data
        try:
            program = Program.objects.get(pk=data.get('program_id'))
            year = ProgramYear.objects.create(
                program=program,
                year=data.get('year'),
                start_date=data.get('start_date'),
                end_date=data.get('end_date')
            )
            return Response(ProgramYearSerializer(year).data, status=201)
        except Program.DoesNotExist:
            return Response({"error": "Invalid program_id"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

@api_view(['GET', 'PUT', 'DELETE'])
def program_year_detail(request, year_id):
    try:
        year = ProgramYear.objects.select_related('program').get(pk=year_id)
    except ProgramYear.DoesNotExist:
        return Response({"error": "Program Year not found"}, status=404)
    if request.method == 'GET':
        return Response(ProgramYearSerializer(year).data)
        
    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()
    if not user or user.role != "admin":
        return Response({"error": "Admin access required"}, status=403)
        
    if request.method == 'PUT':
        data = request.data
        if 'program_id' in data:
            try:
                year.program = Program.objects.get(pk=data['program_id'])
            except Program.DoesNotExist:
                return Response({"error": "Invalid program_id"}, status=400)
        
        year.year = data.get('year', year.year)
        year.start_date = data.get('start_date', year.start_date)
        year.end_date = data.get('end_date', year.end_date)
        year.save()
        return Response(ProgramYearSerializer(year).data)
    elif request.method == 'DELETE':
        year.delete()
        return Response({"message": "Program Year deleted successfully"})

# --- Program Staff ---
@api_view(['GET', 'POST'])
def program_staff_list(request):
    if request.method == 'GET':
        staff = ProgramStaff.objects.select_related('program_year__program', 'user').all()
        serializer = ProgramStaffSerializer(staff, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        username = request.headers.get("Username")
        user = User.objects.filter(username=username).first()
        if not user or user.role != "admin":
            return Response({"error": "Admin access required"}, status=403)
        
        data = request.data
        try:
            program_year = ProgramYear.objects.get(pk=data.get('program_year_id'))
            staff_user = User.objects.get(pk=data.get('userid'))
            if ProgramStaff.objects.filter(program_year=program_year, user=staff_user).exists():
                return Response({"error": "Staff already assigned to this program year"}, status=400)
                
            staff_assignment = ProgramStaff.objects.create(
                program_year=program_year,
                user=staff_user
            )
            return Response(ProgramStaffSerializer(staff_assignment).data, status=201)
        except (ProgramYear.DoesNotExist, User.DoesNotExist):
            return Response({"error": "Invalid program_year_id or userid"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

@api_view(['DELETE'])
def program_staff_detail(request, assignment_id):
    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()
    if not user or user.role != "admin":
        return Response({"error": "Admin access required"}, status=403)
        
    try:
        assignment = ProgramStaff.objects.get(pk=assignment_id)
        assignment.delete()
        return Response({"message": "Staff assignment deleted successfully"})
    except ProgramStaff.DoesNotExist:
        return Response({"error": "Assignment not found"}, status=404)

# --- Enrollments ---
@api_view(['GET', 'POST'])
def enrollments_list(request):
    if request.method == 'GET':
        program_year_id = request.GET.get('program_year_id')
        enrollments = Enrollment.objects.select_related('student', 'program_year__program').all()
        if program_year_id:
            enrollments = enrollments.filter(program_year_id=program_year_id)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        username = request.headers.get("Username")
        user = User.objects.filter(username=username).first()
        if not user or user.role not in ["admin", "staff"]:
            return Response({"error": "Unauthorized"}, status=403)
            
        data = request.data
        try:
            student = Student.objects.get(pk=data.get('studentid'))
            program_year = ProgramYear.objects.get(pk=data.get('program_year_id'))
            
            if Enrollment.objects.filter(student=student, program_year=program_year).exists():
                return Response({"error": "Student already enrolled in this program year"}, status=400)
                
            enrollment = Enrollment.objects.create(
                student=student,
                program_year=program_year,
                status=data.get('status', 'Active')
            )
            return Response(EnrollmentSerializer(enrollment).data, status=201)
        except (Student.DoesNotExist, ProgramYear.DoesNotExist):
            return Response({"error": "Invalid studentid or program_year_id"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

@api_view(['GET', 'PUT', 'DELETE'])
def enrollment_detail(request, enrollment_id):
    try:
        enrollment = Enrollment.objects.select_related('student', 'program_year__program').get(pk=enrollment_id)
    except Enrollment.DoesNotExist:
        return Response({"error": "Enrollment not found"}, status=404)
        
    if request.method == 'GET':
        return Response(EnrollmentSerializer(enrollment).data)
        
    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()
    if not user or user.role not in ["admin", "staff"]:
        return Response({"error": "Unauthorized"}, status=403)
        
    if request.method == 'PUT':
        enrollment.status = request.data.get('status', enrollment.status)
        enrollment.save()
        return Response(EnrollmentSerializer(enrollment).data)
    elif request.method == 'DELETE':
        enrollment.delete()
        return Response({"message": "Enrollment deleted successfully"})

# --- Outcomes ---
@api_view(['GET', 'POST'])
def outcomes_list(request):
    if request.method == 'GET':
        outcomes = Outcome.objects.select_related('enrollement__student', 'enrollement__program_year__program').all()
        serializer = OutcomeSerializer(outcomes, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        user = User.objects.filter(username=request.headers.get("Username")).first()
        if not user or user.role not in ["admin", "staff"]:
            return Response({"error": "Unauthorized"}, status=403)
        
        serializer = OutcomeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def outcome_detail(request, pk):
    try:
        outcome = Outcome.objects.get(pk=pk)
    except Outcome.DoesNotExist:
        return Response({"error": "Outcome not found"}, status=404)

    if request.method == 'GET':
        return Response(OutcomeSerializer(outcome).data)

    user = User.objects.filter(username=request.headers.get("Username")).first()
    if not user or user.role not in ["admin", "staff"]:
        return Response({"error": "Unauthorized"}, status=403)

    if request.method == 'PUT':
        serializer = OutcomeSerializer(outcome, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        outcome.delete()
        return Response({"message": "Outcome deleted successfully"})


# --- Surveys ---
@api_view(['GET', 'POST'])
def surveys_list(request):
    if request.method == 'GET':
        program_year_id = request.GET.get('program_year_id')
        surveys = Survey.objects.all()
        if program_year_id:
            surveys = surveys.filter(program_year_id=program_year_id)
        serializer = SurveySerializer(surveys, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        user = User.objects.filter(username=request.headers.get("Username")).first()
        if not user or user.role not in ["admin", "staff"]:
            return Response({"error": "Unauthorized"}, status=403)
            
        serializer = SurveySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'POST'])
def survey_responses_list(request, survey_id):
    try:
        survey = Survey.objects.get(pk=survey_id)
    except Survey.DoesNotExist:
        return Response({"error": "Survey not found"}, status=404)

    if request.method == 'GET':
        responses = SurveyResponse.objects.filter(survey=survey)
        serializer = SurveyResponseSerializer(responses, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        user = User.objects.filter(username=request.headers.get("Username")).first()
        
        serializer = SurveyResponseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(responder_user=user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# --- Parent Portal APIs ---
@api_view(['GET'])
def students_by_guardian(request, guardian_id):
    """List students associated with a given guardian_id."""
    students = Student.objects.filter(guardian_id=guardian_id).select_related('school')
    data = [{
        "StudentID": s.studentid, 
        "FirstName": s.firstname, 
        "LastName": s.lastname, 
        "Grade": s.grade, 
        "SchoolName": s.school.school if s.school else None
    } for s in students]
    return Response(data)

@api_view(['GET'])
def parent_my_students(request):
    """List students associated with the logged-in parent."""
    user = User.objects.filter(username=request.headers.get("Username")).first()
    if not user or user.role not in ["parent", "admin"]:
        return Response({"error": "Unauthorized"}, status=403)
        
    if user.role == "admin":
        students = Student.objects.all().select_related('school')
    else:
        guardian = Guardian.objects.filter(email=user.email).first()
        if not guardian:
            return Response([], status=200) # No students yet
        students = Student.objects.filter(guardian=guardian).select_related('school')
        
    data = [{
        "StudentID": s.studentid, 
        "FirstName": s.firstname, 
        "LastName": s.lastname, 
        "Grade": s.grade, 
        "SchoolName": s.school.school if s.school else None
    } for s in students]
    return Response(data)

# --- Guardian Management ---
@api_view(['GET', 'POST'])
def guardians_list(request):
    if request.method == 'GET':
        guardians = Guardian.objects.all()
        data = [{
            "guardian_id": g.guardian_id,
            "name": g.name,
            "email": g.email,
            "phone": g.phone,
            "student_count": Student.objects.filter(guardian=g).count()
        } for g in guardians]
        return Response(data)
    
    if request.method == 'POST':
        data = request.data
        guardian = Guardian.objects.create(
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone')
        )
        return Response({"message": "Guardian created", "guardian_id": guardian.guardian_id})

@api_view(['POST'])
def link_student_guardian(request):
    data = request.data
    student_id = data.get('student_id')
    guardian_id = data.get('guardian_id')
    
    student = Student.objects.filter(studentid=student_id).first()
    guardian = Guardian.objects.filter(pk=guardian_id).first()
    
    if not student or not guardian:
        return Response({"error": "Student or Guardian not found"}, status=404)
    
    student.guardian = guardian
    student.save()
    return Response({"message": "Student linked to Guardian successfully"})

@api_view(['POST'])
def parent_enroll_student(request, student_id):
    """Parent enrolls their child in a program year."""
    user = User.objects.filter(username=request.headers.get("Username")).first()
    if not user or user.role not in ["parent", "admin"]:
        return Response({"error": "Unauthorized"}, status=403)
        
    student = Student.objects.filter(studentid=student_id).first()
    if not student:
        return Response({"error": "Student not found"}, status=404)

    if user.role != "admin":
        guardian = Guardian.objects.filter(email=user.email).first()
        if not guardian or student.guardian != guardian:
            return Response({"error": "Student not found or not associated with you"}, status=403)
        
    program_year_id = request.data.get('program_year_id')
    try:
        program_year = ProgramYear.objects.get(pk=program_year_id)
    except ProgramYear.DoesNotExist:
        return Response({"error": "Invalid program_year_id"}, status=400)
        
    if Enrollment.objects.filter(student=student, program_year=program_year).exists():
        return Response({"error": "Student already enrolled in this program"}, status=400)
        
    enrollment = Enrollment.objects.create(
        student=student,
        program_year=program_year,
        status='Active'
    )
    return Response(EnrollmentSerializer(enrollment).data, status=201)

@api_view(['GET'])
def student_academic_summary(request, student_id):
    """Show student academic summary (outcomes, attendance, enrollments) for the parent."""
    user = User.objects.filter(username=request.headers.get("Username")).first()
    if user and user.role == "parent":
        guardian = Guardian.objects.filter(email=user.email).first()
        student = Student.objects.filter(studentid=student_id, guardian=guardian).first()
        if not student:
            return Response({"error": "Unauthorized"}, status=403)

    # Enrollments
    enrollments = Enrollment.objects.filter(student_id=student_id).select_related('program_year__program')
    enrollment_data = [{
        "ProgramName": e.program_year.program.name if (e.program_year and e.program_year.program) else "Unknown", 
        "Year": e.program_year.year if e.program_year else None, 
        "Status": e.status,
        "EnrollmentDate": e.enrollment_date
    } for e in enrollments]
    
    # Attendance
    attendance = Attendance.objects.filter(enrollment__student_id=student_id).select_related('session')
    attendance_data = [{
        "SessionTitle": a.session.title if a.session else "Unknown", 
        "Date": a.session.sessiondate if a.session else None, 
        "Status": a.status,
        "Notes": a.session.description if a.session else ""
    } for a in attendance]
    
    total_att = attendance.count()
    present_att = attendance.filter(status='Present').count()
    attendance_rate = round((present_att / total_att * 100), 1) if total_att > 0 else 0

    # Outcomes
    outcomes = Outcome.objects.filter(enrollment__student_id=student_id).select_related('enrollment__program_year__program')
    outcome_data = OutcomeSerializer(outcomes, many=True).data

    return Response({
        "StudentID": student_id,
        "student": {
            "FirstName": student.firstname,
            "LastName": student.lastname,
            "Grade": student.grade,
            "SchoolName": student.school.school if student.school else None
        },
        "attendance_rate": attendance_rate,
        "enrollments": enrollment_data,
        "attendance": attendance_data,
        "outcomes": outcome_data
    })

@api_view(['POST'])
def parent_create_child(request):
    """Allow a parent to register a new child and link them immediately."""
    user = User.objects.filter(username=request.headers.get("Username")).first()
    if not user or user.role != "parent":
        return Response({"error": "Only parents can register children here."}, status=403)
    
    guardian = Guardian.objects.filter(email=user.email).first()
    if not guardian:
        # Auto-create guardian if missing (should've been created at user birth)
        guardian = Guardian.objects.create(name=user.fullname, email=user.email)

    data = request.data
    program_year_id = data.get("program_year_id")
    if not program_year_id:
        return Response({"error": "Program enrollment is required when registering a child."}, status=400)
    
    student_id = str(data.get("StudentID", "")).strip()
    if not student_id:
        return Response({"error": "Student ID is required."}, status=400)
        
    if Student.objects.filter(studentid=student_id).exists():
        return Response({"error": "A student with this ID is already registered."}, status=400)
    
    try:
        program_year = ProgramYear.objects.get(pk=program_year_id)
    except ProgramYear.DoesNotExist:
        return Response({"error": "Invalid program_year_id."}, status=400)
    
    try:
        school_obj = School.objects.filter(schoolid=data.get("SchoolID")).first()
        student = Student.objects.create(
            studentid=student_id,
            firstname=data.get('FirstName'),
            lastname=data.get('LastName'),
            grade=data.get('Grade'),
            school=school_obj,
            guardian=guardian,
            enrollmentdate=date.today()
        )
        Enrollment.objects.create(
            student=student,
            program_year=program_year,
            status='Active'
        )
        return Response({"message": "Child registered and enrolled successfully!", "StudentID": student.studentid}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def teacher_dashboard_data(request):
    """Fetch assigned programs and sessions for the teacher."""
    user = User.objects.filter(username=request.headers.get("Username")).first()
    if not user or user.role != "teacher":
        return Response({"error": "Unauthorized"}, status=403)
    
    assigned_py_ids = ProgramStaff.objects.filter(user=user).values_list('program_year_id', flat=True)
    programs = ProgramYear.objects.filter(program_year_id__in=assigned_py_ids).select_related('program')
    
    sessions = Session.objects.filter(program_year_id__in=assigned_py_ids).order_by('-sessiondate')[:5]
    
    data = {
        "assigned_programs": [{
            "id": p.program_year_id,
            "name": p.program.name,
            "year": p.year,
            "student_count": Enrollment.objects.filter(program_year=p).count()
        } for p in programs],
        "recent_sessions": [{
            "id": s.sessionid,
            "title": s.title,
            "date": s.sessiondate,
            "program": s.program_year.program.name if s.program_year else "N/A"
        } for s in sessions]
    }
    return Response(data)