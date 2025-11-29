import os
from pathlib import Path
import sys
import os

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-your-secret-key'  # Replace later with env variable
DEBUG = True
                 
ALLOWED_HOSTS = [
    #"scholartrack-nou4.onrender.com",
    #"localhost",
    #"127.0.0.1"
    "*"
]

# Applications
INSTALLED_APPS = [
    "corsheaders",        # ✅ must be at the top
    "rest_framework",
    "backend.core",               # your app
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ✅ must come before CommonMiddleware
    "django.middleware.common.CommonMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = 'backend.scholartrack.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],  # you can create templates folder later
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.scholartrack.wsgi.application'

# Database
#DATABASES = {
#    'default': {
#        'ENGINE': 'mssql',
#        'NAME': 'ScholarTrackDB',  # your SQL database name
#        'USER': 'EDUDB_admin',                   # your SQL Server username
#        'PASSWORD': 'EduScholarsDB25',  # your SQL password
#        'HOST': 'scholartrack-server.database.windows.net',             # or your server name
#        'PORT': '',                  # default MSSQL port
#        'OPTIONS': {
#            'driver': 'ODBC Driver 17 for SQL Server',  # or Driver 18 if installed
#            'trustServerCertificate': True,  
#        },
#    }
#}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'eduscholartrackdb',
        'USER': 'scholar_admin',
        'PASSWORD': '7DP5AZHqQtBlgd0LlSgOm7VKvt5w8jaa',
        'HOST': 'dpg-d4ga1kfgi27c73eb8ukg-a.oregon-postgres.render.com',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
        }
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/Chicago'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

CORS_ALLOW_HEADERS = [
    "content-type",
    "authorization",
    "username",
]

