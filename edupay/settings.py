
from pathlib import Path
import os


BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = 'django-insecure-gsd&(7+092w7rx^f)32i46@03^qv4&z@dhptroj8v=^i))1s#w'

DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    'kaylin-plumbic-luana.ngrok-free.dev'
]

CSRF_TRUSTED_ORIGINS = [
    'https://kaylin-plumbic-luana.ngrok-free.dev',
    'http://localhost:8000'
]


AUTH_USER_MODEL = 'Users.User'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'drf_spectacular',
    'Users',
    'Payments',
    'schools',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'edupay.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

WSGI_APPLICATION = 'edupay.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS':"drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    'TITLE':'edupay API',
    'DESCRIPTION':"School Payment Platform API",
    "VERSION":" 1.0.0",
    "SERVER_INCLUDE_SCHEMA":False
}

PAY_SECRET_KEY  = 'sec-test-ktLJ6uMwt4LjQf6pPkMVZTm4lDyj9TQD'


LOG_DIR = BASE_DIR / 'logs'
LOG_DIR.mkdir(exist_ok=True)

LOGGING = {
    'version':1,
    'disable_existing_loggers':False,
    'formatters':{
        'standard':{
            'format':"[{asctime}] {levelname} {name} - {message}",
            'style':"{",
        },
    },
    'handlers':{
        "console":{
            'class':"logging.StreamHandler",
            'formatter':'standard'
        },
        "file":{
            'level':'INFO',
            'class':'logging.FileHandler',
            'filename':LOG_DIR / 'app.log',
            'formatter':'standard'
        },
    },
    'root':{
        'handlers':['console','file'],
        'level':'INFO'
    },
}


