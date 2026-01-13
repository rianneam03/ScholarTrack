from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import path
from . import views
from backend.core.views import csrf   # your csrf view

@csrf_exempt
def health_check(request):
    return JsonResponse({"status": "ok", "message": "EduScholars backend is running!"})

urlpatterns = [
    path("", health_check),
    path('api/dashboard_data/', views.dashboard_data, name='dashboard_data'),
    path('api/students/', views.students_list, name='students_list'),
    #path('api/students/stem/', views.update_stem_interest, name='update_stem_interest'),
    path('api/sessions/', views.sessions_list, name='sessions_list'),
    path('api/schools/', views.schools_list, name='schools_list'),
    path('api/attendance/', views.attendance_list, name='attendance_list'),
    path('api/schools/<int:school_id>/students/', views.students_by_school, name='students_by_school'),
    path('api/login/', views.login_user, name='login_user'),   # ← NOW no conflict
    path("api/csrf/", csrf),
]
