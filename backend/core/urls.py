from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import path
from . import views
from backend.core.views import csrf  # your csrf view
from .views import export_students_excel

@csrf_exempt
def health_check(request):
    return JsonResponse({"status": "ok", "message": "EduScholars backend is running!"})

urlpatterns = [
    path("", health_check),
    
    # Dashboard
    path('api/dashboard_data/', views.dashboard_data, name='dashboard_data'),

    # Students
    path('api/students/', views.students_list, name='students_list'),
    path("api/students/export/", export_students_excel),
    
    # Schools
    path('api/schools/', views.schools_list, name='schools_list'),
    path('api/schools/<int:school_id>/students/', views.students_by_school, name='students_by_school'),
    
    # Sessions
    path('api/sessions/', views.sessions_list, name='sessions_list'),
    path('api/sessions/<int:session_id>/', views.session_detail, name='session_detail'),
    
    # Attendance
    path('api/attendance/', views.attendance_list, name='attendance_list'),
    path("api/attendance/export/", views.export_attendance, name="export_attendance"),

    # Needs
    path('api/needs/', views.needs_list, name='needs_list'),
    path('api/needs/<int:need_id>/', views.need_detail, name='need_detail'),

    # Users
    path("api/admin/create-user/", views.admin_create_user, name="admin-create-user"),
    path("api/users/", views.list_users, name="list-users"),
    path("api/activate/", views.activate_account, name="activate-account"),
    path('api/login/', views.login_user, name='login_user'),

    # CSRF
    path("api/csrf/", csrf),

    # New endpoints for Programs & Program Years
    path('api/programs/', views.programs_list, name='programs_list'),
    path('api/programs/<int:program_id>/', views.program_detail, name='program_detail'),
    path('api/program_years/', views.program_years_list, name='program_years_list'),
    path('api/program_years/<int:year_id>/', views.program_year_detail, name='program_year_detail'),

    # Enrollments
    path('api/enrollments/', views.enrollments_list, name='enrollments_list'),
    path('api/enrollments/<int:enrollment_id>/', views.enrollment_detail, name='enrollment_detail'),
]