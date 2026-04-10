from rest_framework import serializers
from .models import Student, School, Need, Program, ProgramYear, ProgramStaff, Enrollment, Outcome, Survey, SurveyResponse

class StudentSerializer(serializers.ModelSerializer):
    StudentID = serializers.CharField(source='studentid', required=False) # required=False on updates
    FirstName = serializers.CharField(source='firstname')
    LastName = serializers.CharField(source='lastname')
    Grade = serializers.CharField(source='grade', required=False, allow_blank=True)
    SchoolID = serializers.IntegerField(source='school.schoolid', read_only=True)
    SchoolName = serializers.CharField(source='school.school', read_only=True)
    StudentPhone = serializers.CharField(source='studentphone', required=False, allow_blank=True, allow_null=True)
    GuardianName = serializers.CharField(source='guardianname', required=False, allow_blank=True, allow_null=True)
    GuardianPhone = serializers.CharField(source='guardianphone', required=False, allow_blank=True, allow_null=True)
    Email = serializers.CharField(source='email', required=False, allow_blank=True, allow_null=True)
    STEMInterest = serializers.CharField(source='steminterest', required=False, allow_blank=True)
    EnrollmentDate = serializers.DateField(source='enrollmentdate', required=False)

    class Meta:
        model = Student
        fields = ['StudentID', 'FirstName', 'LastName', 'Grade', 'SchoolID', 'SchoolName', 'StudentPhone', 'GuardianName', 'GuardianPhone', 'Email', 'STEMInterest', 'EnrollmentDate']

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['schoolid', 'school']

class NeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Need
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

class ProgramYearSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.name', read_only=True)
    
    class Meta:
        model = ProgramYear
        fields = '__all__'

class ProgramStaffSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    fullname = serializers.CharField(source='user.fullname', read_only=True)
    program_name = serializers.CharField(source='program_year.program.name', read_only=True)
    year = serializers.IntegerField(source='program_year.year', read_only=True)
    
    class Meta:
        model = ProgramStaff
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    student_firstname = serializers.CharField(source='student.firstname', read_only=True)
    student_lastname = serializers.CharField(source='student.lastname', read_only=True)
    program_name = serializers.CharField(source='program_year.program.name', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = '__all__'

class OutcomeSerializer(serializers.ModelSerializer):
    student_firstname = serializers.CharField(source='enrollement.student.firstname', read_only=True)
    student_lastname = serializers.CharField(source='enrollement.student.lastname', read_only=True)
    program_name = serializers.CharField(source='enrollement.program_year.program.name', read_only=True)
    
    class Meta:
        model = Outcome
        fields = '__all__'

class SurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = Survey
        fields = '__all__'

class SurveyResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyResponse
        fields = '__all__'
