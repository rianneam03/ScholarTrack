from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Student, School, Session, Attendance, User
from django.utils import timezone
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.middleware.csrf import get_token

# ---------------- CSRF ----------------
def csrf(request):
    return JsonResponse({"csrfToken": get_token(request)})

# ---------------- STUDENTS ----------------

@api_view(["GET", "POST"])
def students_list(request):
    # ---------- GET ----------
    if request.method == "GET":
        students = Student.objects.all()
        data = []
        for s in students:
            data.append({
                "StudentID": s.studentid,
                "FirstName": s.firstname,
                "LastName": s.lastname,
                "Grade": s.grade,
                "SchoolID": s.school.schoolid if s.school else None,
                "StudentPhone": s.studentphone,
                "GuardianName": s.guardianname,
                "GuardianPhone": s.guardianphone,
                "Email": s.email,
                "STEMInterest": s.steminterest,
                "EnrollmentDate": s.enrollmentdate,
            })
        return Response(data)

    # ---------- POST (ADD) ----------
    if request.method == "POST":
        data = request.data

        required_fields = ["StudentID", "FirstName", "LastName"]
        for f in required_fields:
            if not data.get(f):
                return Response({"error": f"{f} is required"}, status=400)

        if Student.objects.filter(studentid=data["StudentID"]).exists():
            return Response({"error": "StudentID already exists"}, status=400)

        school = None
        if data.get("SchoolID"):
            school = School.objects.filter(schoolid=data["SchoolID"]).first()

        student = Student.objects.create(
            studentid=data["StudentID"],
            firstname=data.get("FirstName"),
            lastname=data.get("LastName"),
            grade=data.get("Grade"),
            school=school,
            studentphone=data.get("StudentPhone"),
            guardianname=data.get("GuardianName"),
            guardianphone=data.get("GuardianPhone"),
            email=data.get("Email"),
            steminterest=data.get("STEMInterest"),
            enrollmentdate=data.get("EnrollmentDate")
        )

        return Response({"message": "Student added successfully"})


@api_view(["PUT", "DELETE"])
def student_detail(request, student_id):
    student = Student.objects.filter(studentid=student_id).first()
    if not student:
        return Response({"error": "Student not found"}, status=404)

    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()

    # ---------- UPDATE ----------
    if request.method == "PUT":
        data = request.data

        student.firstname = data.get("FirstName", student.firstname)
        student.lastname = data.get("LastName", student.lastname)
        student.grade = data.get("Grade", student.grade)
        student.studentphone = data.get("StudentPhone", student.studentphone)
        student.guardianname = data.get("GuardianName", student.guardianname)
        student.guardianphone = data.get("GuardianPhone", student.guardianphone)
        student.email = data.get("Email", student.email)
        student.steminterest = data.get("STEMInterest", student.steminterest)
        student.enrollmentdate = data.get("EnrollmentDate", student.enrollmentdate)

        if data.get("SchoolID"):
            school = School.objects.filter(schoolid=data["SchoolID"]).first()
            student.school = school

        student.save()
        return Response({"message": "Student updated successfully"})

    # ---------- DELETE (ADMIN ONLY) ----------
    if request.method == "DELETE":
        if not user or user.role != "admin":
            return Response({"error": "Unauthorized"}, status=403)

        student.delete()
        return Response({"message": "Student deleted"})
