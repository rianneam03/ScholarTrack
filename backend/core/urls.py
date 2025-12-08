from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import path
from django.urls import include
from . import views
from backend.core.views import csrf
from .views import login_user   # 👈 THIS MUST EXIST

@csrf_exempt
def health_check(request):
    return JsonResponse({"status": "ok", "message": "EduScholars backend is running!"})

urlpatterns = [
    path('api/', include('rest_framework.urls')),
    path("", health_check),  # ← This fixes the empty path 404
    path('api/dashboard_data/', views.dashboard_data, name='dashboard_data'),
    path('api/students/', views.students_list, name='students_list'),
    path('api/sessions/', views.sessions_list, name='sessions_list'),
    path('api/schools/', views.schools_list,  name='schools_list'),
    path('api/attendance/', views.attendance_list, name='attendance_list'),
    path('api/schools/<int:school_id>/students/', views.students_by_school, name='students_by_school'),
    path('api/login/', views.login_user, name='login_user'),
    path("api/csrf/", csrf),
]

