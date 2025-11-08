from django.urls import path
from . import views

urlpatterns = [
    path('api/dashboard_data/', views.dashboard_data, name='dashboard_data'),
    path('api/students/', views.students_list, name='students_list'),
    path('api/sessions/', views.sessions_list, name='sessions_list'),
    path('api/schools/', views.schools_list,  name='schools_list'),
    path('api/attendance/', views.attendance_list, name='attendance_list'),
    path('api/schools/<int:school_id>/students/', views.students_by_school, name='students_by_school'),
    path('api/login/', views.login_user, name='login_user'),
]

