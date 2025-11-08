from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Student, School, Session, Attendance, User
from django.utils import timezone
from datetime import timedelta


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
        data = request.data

        if not data.get('Title'):
            return Response({"error": "Title is required."}, status=400)
        if not data.get('SessionDate'):
            return Response({"error": "SessionDate is required."}, status=400)

        school_obj = None
        if data.get('SchoolID'):
            school_obj = School.objects.filter(schoolid=data.get('SchoolID')).first()
            if not school_obj:
                return Response({"error": "Invalid SchoolID"}, status=400)

        session = Session.objects.create(
            title=data.get('Title'),
            sessiondate=data.get('SessionDate'),
            description=data.get('Description'),
            schoolid=school_obj
        )

        return Response({"message": "Session added successfully!", "SessionID": session.sessionid})

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

        # Validate Student
        student_obj = Student.objects.filter(studentid=data.get('StudentID')).first()
        if not student_obj:
            return Response({"error": "Invalid StudentID"}, status=400)

        # Validate Session
        session_obj = Session.objects.filter(sessionid=data.get('SessionID')).first()
        if not session_obj:
            return Response({"error": "Invalid SessionID"}, status=400)

        # Create attendance record
        attendance = Attendance.objects.create(
            studentid=student_obj,
            sessionid=session_obj,
            status=data.get('Status')
        )

        return Response({
            "message": "Attendance added successfully!",
            "AttendanceID": attendance.attendanceid
        })

# --- Students list API ---
@api_view(['GET', 'POST', 'DELETE'])
def students_list(request):
    if request.method == 'GET':
        school_id = request.GET.get('school_id')  # optional filter
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

        # Basic validation
        if not data.get('StudentID'):
            return Response({"error": "StudentID is required."}, status=400)
        if Student.objects.filter(studentid=data.get('StudentID')).exists():
            return Response({"error": "StudentID already exists."}, status=400)

        # School validation
        school_obj = None
        if data.get('SchoolID'):
            school_obj = School.objects.filter(schoolid=data.get('SchoolID')).first()
            if not school_obj:
                return Response({"error": "Invalid SchoolID"}, status=400)

        # Create student
        student = Student.objects.create(
            studentid=data.get('StudentID'),
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



# --- Schools list API ---
@api_view(['GET', 'POST'])
def schools_list(request):
    if request.method == 'GET':
        schools = School.objects.all()
        data = []
        for s in schools:
            data.append({
                "SchoolID": s.schoolid,
                "SchoolName": s.school,
            })
        return Response(data)

    elif request.method == 'POST':
        data = request.data
        if not data.get('SchoolName'):
            return Response({"error": "SchoolName is required."}, status=400)

        school = School.objects.create(
            school=data.get('SchoolName')
        )
        return Response({
            "message": "School added successfully!",
            "SchoolID": school.schoolid
        })
    
# --- Students by School API ---
@api_view(['GET'])
def students_by_school(request, school_id):
    students = Student.objects.filter(schoolid=school_id)
    data = [
        {
            "StudentID": s.studentid,
            "FirstName": s.firstname,
            "LastName": s.lastname,
            "Grade": s.grade,
        }
        for s in students
    ]
    return Response(data)

@api_view(['POST'])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = User.objects.filter(username=username).first()
    if not user:
        return Response({"error": "User not found"}, status=404)

    # Plain text demo check
    if password != user.password:
        return Response({"error": "Invalid password"}, status=400)

    return Response({
        "message": "✅ Login successful!",
        "username": user.username,
        "fullname": user.fullname,
        "email": user.email,
        "userid": user.userid,
        "role": user.role if hasattr(user, "role") else "teacher"
    })



