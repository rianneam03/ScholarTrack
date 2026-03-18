from django.contrib import admin
from .models import (
    School, Student, Session, Attendance, Outcome, User,
    Program, ProgramYear, Enrollment, Need, ProgramStaff
)

# Existing models
admin.site.register(School)
admin.site.register(Student)
admin.site.register(Session)
admin.site.register(Attendance)
admin.site.register(Outcome)
admin.site.register(User)

# New models
admin.site.register(Program)
admin.site.register(ProgramYear)
admin.site.register(Enrollment)
admin.site.register(ProgramStaff)
admin.site.register(Need)