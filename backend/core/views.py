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
@api_view(["GET", "POST", "PATCH"])
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
                "SchoolName": s.school.school if s.school else None,
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
        username = request.headers.get("Username")
        user = User.objects.filter(username=username).first()
        is_admin = user and user.role == "admin"
        is_staff = user and user.role == "teacher"

        required_fields = ["StudentID", "FirstName", "LastName"] if is_admin else ["FirstName", "LastName"]
        for f in required_fields:
            if not data.get(f):
                return Response({"error": f"{f} is required"}, status=400)

        student_id = data.get("StudentID")
        if is_staff and not student_id:
            # Generate new ID if staff didn't provide one
            max_id = Student.objects.aggregate(max_id=models.Max('studentid'))['max_id'] or 0
            student_id = max_id + 1

        if student_id and Student.objects.filter(studentid=student_id).exists():
            return Response({"error": "StudentID already exists"}, status=400)

        school = None
        if data.get("SchoolID"):
            school = School.objects.filter(schoolid=data["SchoolID"]).first()

        student = Student.objects.create(
            studentid=student_id,
            firstname=data.get("FirstName"),
            lastname=data.get("LastName"),
            grade=data.get("Grade"),
            school=school,
            studentphone=data.get("StudentPhone") if is_admin else "",
            guardianname=data.get("GuardianName") if is_admin else "",
            guardianphone=data.get("GuardianPhone") if is_admin else "",
            email=data.get("Email") if is_admin else "",
            steminterest=data.get("STEMInterest"),
            enrollmentdate=data.get("EnrollmentDate")
        )

        return Response({"message": "Student added successfully", "StudentID": student.studentid})

    # ---------- PATCH (UPDATE) ----------
    if request.method == "PATCH":
        data = request.data
        student_id = data.get("StudentID")
        if not student_id:
            return Response({"error": "StudentID required"}, status=400)

        try:
            student = Student.objects.get(studentid=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)

        username = request.headers.get("Username")
        user = User.objects.filter(username=username).first()
        is_admin = user and user.role == "admin"
        is_staff = user and user.role == "teacher"

        # Update allowed fields
        for field in [
            "FirstName", "LastName", "Grade", "SchoolID",
            "STEMInterest", "EnrollmentDate"
        ]:
            if data.get(field) is not None:
                if field == "SchoolID":
                    school_obj = School.objects.filter(schoolid=data.get(field)).first()
                    student.school = school_obj
                elif field == "FirstName":
                    student.firstname = data.get("FirstName")
                elif field == "LastName":
                    student.lastname = data.get("LastName")
                elif field == "Grade":
                    student.grade = data.get("Grade")
                elif field == "STEMInterest":
                    student.steminterest = data.get("STEMInterest")
                elif field == "EnrollmentDate":
                    student.enrollmentdate = data.get("EnrollmentDate")

        if is_admin:
            # Admin can also update contact info
            for field in ["StudentPhone", "GuardianName", "GuardianPhone", "Email"]:
                if data.get(field) is not None:
                    setattr(student, field.lower(), data.get(field))

        student.save()
        return Response({"message": "Student updated successfully"})

@api_view(["DELETE"])
def student_detail(request, student_id):
    student = Student.objects.filter(studentid=student_id).first()
    if not student:
        return Response({"error": "Student not found"}, status=404)

    username = request.headers.get("Username")
    user = User.objects.filter(username=username).first()

    if not user or user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)

    student.delete()
    return Response({"message": "Student deleted"})
