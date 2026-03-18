from django.db import models

# ----------------------------
# School Model
# ----------------------------
class School(models.Model):
    schoolid = models.AutoField(db_column='schoolid', primary_key=True)
    school = models.CharField(db_column='school', max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'schools'
        verbose_name = "School"
        verbose_name_plural = "Schools"

    def __str__(self):
        return self.school or f"School {self.schoolid}"


# ----------------------------
# Student Model
# ----------------------------
class Student(models.Model):
    studentid = models.CharField(db_column='studentid', primary_key=True, max_length=6)
    firstname = models.CharField(db_column='firstname', max_length=50)
    lastname = models.CharField(db_column='lastname', max_length=50)
    grade = models.CharField(db_column='grade', max_length=20, blank=True, null=True)

    school = models.ForeignKey(
        School,
        models.DO_NOTHING,
        db_column='schoolid',
        blank=True,
        null=False
    )

    studentphone = models.CharField(db_column='studentphone', max_length=20, blank=True, null=True)
    guardianname = models.CharField(db_column='guardianname', max_length=100, blank=True, null=True)
    guardianphone = models.CharField(db_column='guardianphone', max_length=20, blank=True, null=True)
    email = models.CharField(db_column='email', max_length=100, blank=True, null=True)
    steminterest = models.CharField(db_column='steminterest', max_length=20, blank=True, null=True)
    enrollmentdate = models.DateField(db_column='enrollementdate', blank=True, null=True)
    guardian = models.ForeignKey('Guardian', models.DO_NOTHING, db_column='guardian_id', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'students'
        verbose_name = "Student"
        verbose_name_plural = "Students"

    def __str__(self):
        return f"{self.firstname} {self.lastname}"


# ----------------------------
# Session Model
# ----------------------------
class Session(models.Model):
    sessionid = models.AutoField(db_column='sessionid', primary_key=True)
    title = models.CharField(db_column='title', max_length=100)
    sessiondate = models.DateField(db_column='sessiondate')
    description = models.CharField(db_column='description', max_length=255, blank=True, null=True)

    program_year = models.ForeignKey(
        'ProgramYear',
        models.DO_NOTHING,
        db_column='program_year_id',
        blank=True,
        null=False
    )

    class Meta:
        managed = False
        db_table = 'sessions'
        verbose_name = "Session"
        verbose_name_plural = "Sessions"

    def __str__(self):
        return f"{self.title} ({self.sessiondate})"


# ----------------------------
# Attendance Model
# ----------------------------
class Attendance(models.Model):
    attendanceid = models.AutoField(db_column='attendanceid', primary_key=True)

    session = models.ForeignKey(
        Session,
        models.DO_NOTHING,
        db_column='sessionid',
        blank=True,
        null=False
    )

    status = models.CharField(db_column='status', max_length=20, blank=True, null=True)
    notes = models.TextField(db_column='notes', blank=True, null=True)
    enrollment = models.ForeignKey('Enrollment', models.DO_NOTHING, db_column='enrollment_id', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'attendance'
        verbose_name = "Attendance Record"
        verbose_name_plural = "Attendance Records"

    def __str__(self):
        return f"{self.enrollment} - {self.session}: {self.status}"


# ----------------------------
# Outcome Model
# ----------------------------
class Outcome(models.Model):
    outcomeid = models.AutoField(db_column='outcomeid', primary_key=True)
    gradewhenenrolled = models.CharField(db_column='gradewhenenrolled', max_length=20, blank=True, null=True)
    dateenrolled = models.DateField(db_column='dateenrolled', blank=True, null=True)
    dateexited = models.DateField(db_column='dateexited', blank=True, null=True)
    graduationdate = models.DateField(db_column='graduationdate', blank=True, null=True)
    acceptedcollege = models.CharField(db_column='acceptedcollege', max_length=100, blank=True, null=True)
    attendedcollege = models.CharField(db_column='attendedcollege', max_length=100, blank=True, null=True)
    collegename = models.CharField(db_column='collegename', max_length=100, blank=True, null=True)
    majorminor = models.CharField(db_column='majorminor', max_length=100, blank=True, null=True)
    scholarship = models.CharField(db_column='scholarship', max_length=100, blank=True, null=True)
    stemcareer = models.CharField(db_column='stemcareer', max_length=100, blank=True, null=True)
    careerfield = models.CharField(db_column='careerfield', max_length=100, blank=True, null=True)
    totaldayspresent = models.IntegerField(db_column='totaldayspresent', blank=True, null=True)
    totaldaysabsent = models.IntegerField(db_column='totaldaysabsent', blank=True, null=True)
    totaldaysunknown = models.IntegerField(db_column='totaldaysunknown', blank=True, null=True)
    enrollement = models.ForeignKey('Enrollment', models.DO_NOTHING, db_column='enrollement_id', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'outcomes'
        verbose_name = "Outcome"
        verbose_name_plural = "Outcomes"

    def __str__(self):
        return f"Outcome {self.outcomeid}"


# ----------------------------
# User Model
# ----------------------------
class User(models.Model):
    userid = models.AutoField(db_column='userid', primary_key=True)
    username = models.CharField(db_column='username', unique=True, max_length=50, null=True, blank=True)
    password = models.CharField(db_column='password', max_length=255)
    fullname = models.CharField(db_column='fullname', max_length=100, blank=True, null=True)
    email = models.CharField(db_column='email', max_length=100, blank=True, null=True)
    createdat = models.DateTimeField(db_column='createdat', blank=True, null=True)
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('staff', 'Staff'),
        ('parent', 'Parent/Guardian'),
        ('student', 'Student'),
    ]
    role = models.CharField(db_column='role', max_length=20, choices=ROLE_CHOICES, default='staff')
    is_active = models.BooleanField(default=True)
    activation_token = models.CharField(max_length=64, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users'
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.username or f"User {self.userid}"


# ----------------------------
# Need Model
# ----------------------------
class Need(models.Model):
    needid = models.AutoField(db_column='needid', primary_key=True)
    title = models.CharField(db_column='title', max_length=100)
    description = models.TextField(db_column='description', blank=True, null=True)
    amount_needed = models.DecimalField(db_column='amount_needed', max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(db_column='current_amount', max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(db_column='created_at', auto_now_add=True)
    urgency = models.CharField(db_column='urgency', max_length=20, default='Medium')

    class Meta:
        managed = True
        db_table = 'needs'
        verbose_name = "Need"
        verbose_name_plural = "Needs"

    def __str__(self):
        return self.title


# ----------------------------
# Program Model
# ----------------------------
class Program(models.Model):
    program_id = models.AutoField(db_column='program_id', primary_key=True)
    name = models.CharField(db_column='name', max_length=150)
    description = models.TextField(db_column='description', blank=True, null=True)
    created_at = models.DateTimeField(db_column='created_at', auto_now_add=True, null=True)

    class Meta:
        managed = False
        db_table = 'programs'
        verbose_name = "Program"
        verbose_name_plural = "Programs"

    def __str__(self):
        return self.name


# ----------------------------
# ProgramYear Model
# ----------------------------
class ProgramYear(models.Model):
    program_year_id = models.AutoField(db_column='program_year_id', primary_key=True)
    program = models.ForeignKey(Program, models.DO_NOTHING, db_column='program_id')
    year = models.CharField(db_column='year', max_length=20)  # e.g., '2023-2024'
    start_date = models.DateField(db_column='start_date', blank=True, null=True)
    end_date = models.DateField(db_column='end_date', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'program_years'
        verbose_name = "Program Year"
        verbose_name_plural = "Program Years"

    def __str__(self):
        return f"{self.program.name} - {self.year}"


# ----------------------------
# ProgramStaff Model
# ----------------------------
class ProgramStaff(models.Model):
    assignmentid = models.AutoField(db_column='assignmentid', primary_key=True)
    program_year = models.ForeignKey(ProgramYear, models.DO_NOTHING, db_column='program_year_id')
    user = models.ForeignKey(User, models.DO_NOTHING, db_column='userid')

    class Meta:
        managed = False
        db_table = 'program_staff'
        verbose_name = "Program Staff Assignment"
        verbose_name_plural = "Program Staff Assignments"
        unique_together = (('program_year', 'user'),)

    def __str__(self):
        return f"{self.user.username} -> {self.program_year}"


# ----------------------------
# Enrollment Model
# ----------------------------
class Enrollment(models.Model):
    enrollment_id = models.AutoField(db_column='enrollment_id', primary_key=True)
    student = models.ForeignKey(Student, models.DO_NOTHING, db_column='studentid')
    program_year = models.ForeignKey(ProgramYear, models.DO_NOTHING, db_column='program_year_id')
    enrollment_date = models.DateField(db_column='enrollment_date', auto_now_add=True)
    status = models.CharField(db_column='status', max_length=20, default='Active')

    class Meta:
        managed = False
        db_table = 'enrollements'
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"
        unique_together = (('student', 'program_year'),)

    def __str__(self):
        return f"{self.student} - {self.program_year} ({self.status})"


# ----------------------------
# Guardian Model
# ----------------------------
class Guardian(models.Model):
    guardian_id = models.AutoField(db_column='guardian_id', primary_key=True)
    name = models.CharField(db_column='name', max_length=150)
    phone = models.CharField(db_column='phone', max_length=20, blank=True, null=True)
    email = models.CharField(db_column='email', max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'guardians'
        verbose_name = "Guardian"
        verbose_name_plural = "Guardians"

    def __str__(self):
        return self.name
