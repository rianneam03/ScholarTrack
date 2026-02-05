# attendance/serializers.py
from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = [
            'attendanceid',
            'studentid',
            'sessionid',
            'status'
        ]
