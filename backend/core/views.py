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

from .models import Student, School, Session, Attendance, User, Need, Program, ProgramYear, ProgramStaff, Enrollment
from .serializers import SchoolSerializer, NeedSerializer, ProgramSerializer, ProgramYearSerializer, ProgramStaffSerializer, EnrollmentSerializer
from .utils import send_activation_email

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
    
    total_sessions_conducted = Session.objects.filter(sessiondate__lt=today).count()
    total_sessions_upcoming = Session.objects.filter(sessiondate__gte=today).count()

    total_attendance_records = Attendance.objects.count()
    total_present = Attendance.objects.filter(status__iexact='Present').count()
    attendance_rate = round((total_present / total_attendance_records) * 100, 1) if total_attendance_records else 0
    avg_attendance = round(total_present / total_sessions_conducted, 1) if total_sessions_conducted else 0

    # Students by Grade
    grades_qs = Student.objects.values('grade').annotate(count=Count('grade')).order_by('grade')
    students_by_grade = [{"name": item['grade'] or "Unknown", "value": item['count']} for item in grades_qs]

    # Students by School
    schools_qs = School.objects.annotate(count=Count('student')).order_by('-count')
    students_by_school = [{"name": item.school, "value": item.count} for item in schools_qs]

    # Student growth over time
    growth_qs = Student.objects.filter(enrollmentdate__isnull=False)\
        .annotate(month=TruncMonth('enrollmentdate'))\
        .values('month')\
        .annotate(count=Count('studentid'))\
        .order_by('month')
    student_growth = [{"name": item['month'].strftime("%Y-%m"), "value": item['count']} for item in growth_qs]

    stem_no_count = total_students - stem_yes
    stem_data = [{"name": "STEM Interest", "value": stem_yes}, {"name": "Other", "value": stem_no_count}]

    data = {
        "total_students": total_students,
        "total_schools": total_schools,
        "stem_percent": stem_percent,
        "upcoming_sessions": total_sessions_upcoming,
        "sessions_conducted": total_sessions_conducted,
        "attendance_rate": attendance_rate,
        "avg_attendance": avg_attendance,
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
        sessions = Session.objects.select_related('program_year__program').all()
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
        attendance_records = Attendance.objects.select_related('student', 'session').all()
        if session_id:
            attendance_records = attendance_records.filter(session__sessionid=session_id)
        data = []
        for a in attendance_records:
            data.append({
                "AttendanceID": a.attendanceid,
                "StudentID": a.student.studentid if a.student else None,
                "StudentName": f"{a.student.firstname} {a.student.lastname}" if a.student else None,
                "SessionID": a.session.sessionid if a.session else None,
                "SessionTitle": a.session.title if a.session else None,
                "Status": a.status,
            })
        return Response(data)

    elif request.method == 'POST':
        data = request.data
        if not data.get('StudentID') or not data.get('SessionID') or not data.get('Status'):
            return Response({"error": "StudentID, SessionID, and Status are required."}, status=400)

        student_obj = Student.objects.filter(studentid=data.get('StudentID')).first()
        session_obj = Session.objects.filter(sessionid=data.get('SessionID')).first()
        if not student_obj or not session_obj:
            return Response({"error": "Invalid StudentID or SessionID"}, status=400)

        attendance = Attendance.objects.filter(student=student_obj, session=session_obj).first()
        if attendance:
            attendance.status = data.get('Status')
            attendance.save()
            return Response({"message": "Attendance updated"})
        else:
            Attendance.objects.create(student=student_obj, session=session_obj, status=data.get('Status'))
            return Response({"message": "Attendance created"})

@api_view(["GET"])
def export_attendance(request):
    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()
    if not user or user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)
    session_id = request.GET.get("session_id")
    if not session_id:
        return Response({"error": "session_id is required"}, status=400)

    attendance = Attendance.objects.select_related("student", "session", "session__program_year__program").filter(session__sessionid=session_id)
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Attendance"
    headers = ["Student ID", "First Name", "Last Name", "Program", "Session Title", "Session Date", "Status"]
    ws.append(headers)
    for a in attendance:
        program_name = a.session.program_year.program.name if a.session and a.session.program_year and hasattr(a.session.program_year, 'program') else ""
        ws.append([
            a.student.studentid if a.student else "",
            a.student.firstname if a.student else "",
            a.student.lastname if a.student else "",
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
    data = [{"fullname": u.fullname,"username": u.username,"email": u.email,"role": u.role,"is_active": u.is_active} for u in users]
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
        user = User(fullname=data["fullname"],email=data["email"],role=data.get("role","teacher"),is_active=False,activation_token=token,password="",createdat=timezone.now())
        user.save()
        try: send_activation_email(user.email, token)
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

# --- Enrollments ---
@api_view(['GET', 'POST'])
def enrollments_list(request):
    if request.method == 'GET':
        enrollments = Enrollment.objects.select_related('student', 'program_year__program').all()
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