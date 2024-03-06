from rest_framework import serializers
from .models import User
import os
from dotenv import load_dotenv

load_dotenv()
class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = '__all__'

    def get_profile_picture(self, obj):
        return f"https://res.cloudinary.com/{os.getenv('CLOUDINARY_NAME')}/{obj.profile_picture}"