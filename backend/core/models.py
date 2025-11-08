from django.db import models


# ----------------------------
#  School Model
# ----------------------------
class School(models.Model):
    schoolid = models.AutoField(db_column='SchoolID', primary_key=True)
    school = models.CharField(db_column='School', max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Schools'
        verbose_name = "School"
        verbose_name_plural = "Schools"


# ----------------------------
#  Student Model
# ----------------------------
class Student(models.Model):
    studentid = models.CharField(db_column='StudentID', primary_key=True, max_length=6)
    firstname = models.CharField(db_column='FirstName', max_length=50)
    lastname = models.CharField(db_column='LastName', max_length=50)
    grade = models.CharField(db_column='Grade', max_length=20, blank=True, null=True)
    school = models.ForeignKey(School, models.DO_NOTHING, db_column='SchoolID', blank=True, null=True)
    studentphone = models.CharField(db_column='StudentPhone', max_length=20, blank=True, null=True)
    guardianname = models.CharField(db_column='GuardianName', max_length=100, blank=True, null=True)
    guardianphone = models.CharField(db_column='GuardianPhone', max_length=20, blank=True, null=True)
    email = models.CharField(db_column='Email', max_length=100, blank=True, null=True)
    steminterest = models.CharField(db_column='STEMInterest', max_length=20, blank=True, null=True)
    enrollmentdate = models.DateField(db_column='EnrollmentDate', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Students'
        verbose_name = "Student"
        verbose_name_plural = "Students"


# ----------------------------
#  Session Model
# ----------------------------
class Session(models.Model):
    sessionid = models.AutoField(db_column='SessionID', primary_key=True)
    title = models.CharField(db_column='Title', max_length=100)
    sessiondate = models.DateField(db_column='SessionDate')
    description = models.CharField(db_column='Description', max_length=255, blank=True, null=True)
    schoolid = models.ForeignKey(School, models.DO_NOTHING, db_column='SchoolID', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Sessions'
        verbose_name = "Session"
        verbose_name_plural = "Sessions"


# ----------------------------
#  Attendance Model
# ----------------------------
class Attendance(models.Model):
    attendanceid = models.AutoField(db_column='AttendanceID', primary_key=True)
    studentid = models.ForeignKey(Student, models.DO_NOTHING, db_column='StudentID', blank=True, null=True)
    sessionid = models.ForeignKey(Session, models.DO_NOTHING, db_column='SessionID', blank=True, null=True)
    status = models.CharField(db_column='Status', max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Attendance'
        verbose_name = "Attendance Record"
        verbose_name_plural = "Attendance Records"


# ----------------------------
#  Outcomes Model
# ----------------------------
class Outcome(models.Model):
    outcomeid = models.AutoField(db_column='OutcomeID', primary_key=True)
    studentid = models.ForeignKey(Student, models.DO_NOTHING, db_column='StudentID', blank=True, null=True)
    graduationyear = models.IntegerField(db_column='GraduationYear', blank=True, null=True)
    collegename = models.CharField(db_column='CollegeName', max_length=100, blank=True, null=True)
    major = models.CharField(db_column='Major', max_length=100, blank=True, null=True)
    careerpath = models.CharField(db_column='CareerPath', max_length=100, blank=True, null=True)
    isstem = models.BooleanField(db_column='IsSTEM', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Outcomes'
        verbose_name = "Outcome"
        verbose_name_plural = "Outcomes"


# ----------------------------
#  User Model
# ----------------------------
class User(models.Model):
    userid = models.AutoField(db_column='UserID', primary_key=True)
    username = models.CharField(db_column='Username', unique=True, max_length=50)
    password = models.CharField(db_column='Password', max_length=255)
    fullname = models.CharField(db_column='FullName', max_length=100, blank=True, null=True)
    email = models.CharField(db_column='Email', max_length=100, blank=True, null=True)
    createdat = models.DateTimeField(db_column='CreatedAt', blank=True, null=True)
    role = models.CharField(db_column='Role', max_length=20, default='teacher')

    class Meta:
        managed = False
        db_table = 'Users'
        verbose_name = "User"
        verbose_name_plural = "Users"
