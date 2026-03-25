from django.db import models

class User(models.Model):
    userid = models.AutoField(db_column='userid', primary_key=True)
    username = models.CharField(db_column='username', unique=True, max_length=50, null=True, blank=True)
    password = models.CharField(db_column='password', max_length=255, blank=True, null=True)
    fullname = models.CharField(db_column='fullname', max_length=100, blank=True, null=True)
    email = models.CharField(db_column='email', max_length=100, blank=True, null=True)
    createdat = models.DateTimeField(db_column='createdat', blank=True, null=True)
    role = models.CharField(db_column='role', max_length=20, blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True, default=True)
    activation_token = models.CharField(max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users'

class School(models.Model):
    schoolid = models.AutoField(primary_key=True, db_column='schoolid')
    school = models.CharField(max_length=100, db_column='school')

    class Meta:
        managed = False
        db_table = 'schools'
        
class Guardian(models.Model):
    guardian_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'guardians'

class Student(models.Model):
    studentid = models.CharField(primary_key=True, max_length=6, db_column='studentid')
    firstname = models.CharField(max_length=50, blank=True, null=True, db_column='firstname')
    lastname = models.CharField(max_length=50, blank=True, null=True, db_column='lastname')
    grade = models.CharField(max_length=20, blank=True, null=True, db_column='grade')
    steminterest = models.CharField(max_length=20, blank=True, null=True, db_column='steminterest')
    enrollmentdate = models.DateField(blank=True, null=True, db_column='enrollmentdate')
    school = models.ForeignKey(School, models.DO_NOTHING, db_column='schoolid', blank=True, null=True)
    studentphone = models.CharField(max_length=20, blank=True, null=True, db_column='studentphone')
    guardianname = models.CharField(max_length=100, blank=True, null=True, db_column='guardianname')
    guardianphone = models.CharField(max_length=20, blank=True, null=True, db_column='guardianphone')
    email = models.CharField(max_length=100, blank=True, null=True, db_column='email')
    guardian = models.ForeignKey(Guardian, models.DO_NOTHING, db_column='guardian_id', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'students'

class Program(models.Model):
    program_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'programs'

class ProgramYear(models.Model):
    program_year_id = models.AutoField(primary_key=True)
    program = models.ForeignKey(Program, models.DO_NOTHING, blank=True, null=True, db_column='program_id')
    year = models.IntegerField()
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'program_years'

class ProgramStaff(models.Model):
    assignmentid = models.AutoField(primary_key=True)
    program_year = models.ForeignKey(ProgramYear, models.DO_NOTHING, blank=True, null=True, db_column='program_year_id')
    user = models.ForeignKey(User, models.DO_NOTHING, db_column='userid', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'program_staff'

class Enrollment(models.Model):
    enrollment_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, models.DO_NOTHING, blank=True, null=True, db_column='student_id')
    program_year = models.ForeignKey(ProgramYear, models.DO_NOTHING, blank=True, null=True, db_column='program_year_id')
    enrollment_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'enrollments'

class Session(models.Model):
    sessionid = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    sessiondate = models.DateField()
    description = models.CharField(max_length=255, blank=True, null=True)
    program_year = models.ForeignKey(ProgramYear, models.DO_NOTHING, blank=True, null=True, db_column='program_year_id')

    class Meta:
        managed = False
        db_table = 'sessions'

class Attendance(models.Model):
    attendanceid = models.AutoField(primary_key=True)
    session = models.ForeignKey(Session, models.DO_NOTHING, db_column='sessionid')
    enrollment = models.ForeignKey(Enrollment, models.DO_NOTHING, db_column='enrollment_id')
    status = models.CharField(max_length=20)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'attendance'

class Outcome(models.Model):
    outcomeid = models.IntegerField(primary_key=True)
    gradewhenenrolled = models.CharField(max_length=20, blank=True, null=True)
    dateenrolled = models.DateField(blank=True, null=True)
    dateexited = models.DateField(blank=True, null=True)
    graduationdate = models.CharField(max_length=10, blank=True, null=True)
    acceptedcollege = models.TextField(blank=True, null=True)
    attendedcollege = models.TextField(blank=True, null=True)
    collegename = models.CharField(max_length=100, blank=True, null=True)
    majorminor = models.CharField(max_length=100, blank=True, null=True)
    scholarship = models.TextField(blank=True, null=True)
    stemcareer = models.TextField(blank=True, null=True)
    careerfield = models.CharField(max_length=100, blank=True, null=True)
    totaldayspresent = models.IntegerField(blank=True, null=True)
    totaldaysabsent = models.IntegerField(blank=True, null=True)
    totaldaysunknown = models.IntegerField(blank=True, null=True)
    enrollment = models.ForeignKey(Enrollment, models.DO_NOTHING, blank=True, null=True, db_column='enrollment_id')

    class Meta:
        managed = False
        db_table = 'outcomes'

# ----------------------------
# Models to be managed (Migrations required)
# ----------------------------
class Need(models.Model):
    needid = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    amount_needed = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    urgency = models.CharField(max_length=20, default='Medium')

    class Meta:
        managed = True
        db_table = 'needs'

class Survey(models.Model):
    survey_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    program_year = models.ForeignKey(ProgramYear, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = True
        db_table = 'surveys'

class SurveyResponse(models.Model):
    response_id = models.AutoField(primary_key=True)
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE)
    responder_user = models.ForeignKey(User, on_delete=models.CASCADE)
    responses_json = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = True
        db_table = 'survey_responses'