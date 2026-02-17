from rest_framework import serializers
from .models import School

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['schoolid', 'school']

class NeedSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import Need
        model = Need
        fields = '__all__'

