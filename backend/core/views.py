# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Student, School, User
from django.http import JsonResponse
from django.middleware.csrf import get_token

# ---------------- CSRF ----------------
def csrf(request):
    return JsonResponse({"csrfToken": get_token(request)})

# ---------------- DASHBOARD ----------------
@api_view(["GET"])
def dashboard_data(request):
    total_students = Student.objects.count()
    total_schools = School.objects.count()
    return Response({
        "total_students": total_students,
        "total_schools": total_schools,
    })

# ---------------- STUDENTS ----------------
@api_view(["GET", "POST"])
def students_list(request):
    if request.method == "GET":
        students = Student.objects.all()
        data = [
            {
                "StudentID": s.studentid,
                "FirstName": s.firstname,
                "LastName": s.lastname,
                "Grade": s.grade,
                "SchoolID": s.school.schoolid if s.school else "",
                "SchoolName": s.school.schoolname if s.school else "",
                "StudentPhone": s.studentphone,
                "GuardianName": s.guardianname,
                "GuardianPhone": s.guardianphone,
                "Email": s.email,
                "STEMInterest": s.steminterest,
                "EnrollmentDate": s.enrollmentdate,
            }
            for s in students
        ]
        return Response(data)

    if request.method == "POST":
        data = request.data
        if Student.objects.filter(studentid=data["StudentID"]).exists():
            return Response({"error": "StudentID already exists"}, status=400)
        school = School.objects.filter(schoolid=data.get("SchoolID")).first()
        Student.objects.create(
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

    user = User.objects.filter(username=request.headers.get("Username")).first()

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
            student.school = School.objects.filter(schoolid=data["SchoolID"]).first()

        student.save()
        return Response({"message": "Student updated successfully"})

    if request.method == "DELETE":
        if not user or user.role != "admin":
            return Response({"error": "Unauthorized"}, status=403)
        student.delete()
        return Response({"message": "Student deleted"})
