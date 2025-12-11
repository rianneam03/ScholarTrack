from django.db import models


# ----------------------------
#  School Model
# ----------------------------
class School(models.Model):
    schoolid = models.AutoField(db_column='schoolid', primary_key=True)
    school = models.CharField(db_column='school', max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'schools'
        verbose_name = "School"
        verbose_name_plural = "Schools"


# ----------------------------
#  Student Model
# ----------------------------
class Student(models.Model):
    studentid = models.CharField(db_column='studentid', primary_key=True, max_length=6)
    firstname = models.CharField(db_column='firstname', max_length=50)
    lastname = models.CharField(db_column='lastname', max_length=50)
    grade = models.CharField(db_column='grade', max_length=20, blank=True, null=True)
    school = models.ForeignKey(School, models.DO_NOTHING, db_column='schoolid', blank=True, null=True)
    studentphone = models.CharField(db_column='studentphone', max_length=20, blank=True, null=True)
    guardianname = models.CharField(db_column='guardianname', max_length=100, blank=True, null=True)
    guardianphone = models.CharField(db_column='guardianphone', max_length=20, blank=True, null=True)
    email = models.CharField(db_column='email', max_length=100, blank=True, null=True)
    steminterest = models.CharField(db_column='steminterest', max_length=20, blank=True, null=True)
    enrollmentdate = models.DateField(db_column='enrollmentdate', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'students'
        verbose_name = "Student"
        verbose_name_plural = "Students"


# ----------------------------
#  Session Model
# ----------------------------
class Session(models.Model):
    sessionid = models.AutoField(db_column='sessionid', primary_key=True)
    title = models.CharField(db_column='title', max_length=100)
    sessiondate = models.DateField(db_column='sessiondate')
    description = models.CharField(db_column='description', max_length=255, blank=True, null=True)
    schoolid = models.ForeignKey(School, models.DO_NOTHING, db_column='schoolid', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'sessions'
        verbose_name = "Session"
        verbose_name_plural = "Sessions"


# ----------------------------
#  Attendance Model
# ----------------------------
class Attendance(models.Model):
    attendanceid = models.AutoField(db_column='attendanceid', primary_key=True)
    studentid = models.ForeignKey(Student, models.DO_NOTHING, db_column='studentid', blank=True, null=True)
    sessionid = models.ForeignKey(Session, models.DO_NOTHING, db_column='sessionid', blank=True, null=True)
    status = models.CharField(db_column='status', max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'attendance'
        verbose_name = "Attendance Record"
        verbose_name_plural = "Attendance Records"


# ----------------------------
#  Outcomes Model
# ----------------------------
class Outcome(models.Model):
    outcomeid = models.AutoField(db_column='outcomeid', primary_key=True)
    studentid = models.ForeignKey(Student, models.DO_NOTHING, db_column='studentid', blank=True, null=True)
    graduationyear = models.IntegerField(db_column='graduationyear', blank=True, null=True)
    collegename = models.CharField(db_column='collegename', max_length=100, blank=True, null=True)
    major = models.CharField(db_column='major', max_length=100, blank=True, null=True)
    careerpath = models.CharField(db_column='careerpath', max_length=100, blank=True, null=True)
    isstem = models.BooleanField(db_column='isstem', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'outcomes'
        verbose_name = "Outcome"
        verbose_name_plural = "Outcomes"


# ----------------------------
#  User Model
# ----------------------------
class User(models.Model):
    userid = models.AutoField(db_column='userid', primary_key=True)
    username = models.CharField(db_column='username', unique=True, max_length=50)
    password = models.CharField(db_column='password', max_length=255)
    fullname = models.CharField(db_column='fullname', max_length=100, blank=True, null=True)
    email = models.CharField(db_column='email', max_length=100, blank=True, null=True)
    createdat = models.DateTimeField(db_column='createdat', blank=True, null=True)
    role = models.CharField(db_column='role', max_length=20, default='teacher')

    class Meta:
        managed = False
        db_table = 'users'
        verbose_name = "User"
        verbose_name_plural = "Users"
