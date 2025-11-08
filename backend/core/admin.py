from django.contrib import admin
from .models import School, Student, Session, Attendance, Outcome, User

admin.site.register(School)
admin.site.register(Student)
admin.site.register(Session)
admin.site.register(Attendance)
admin.site.register(Outcome)
admin.site.register(User)
