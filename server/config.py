# config.py - Configuration settings for different environments

import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hard-to-guess-string'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    IMAGES_DIR = os.path.join(basedir, 'static/images')
    
    # JWT settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'

    FACE_RECOGNITION_TOLERANCE = 0.4
    
    @staticmethod
    def init_app(app):
        # Create images directory if it doesn't exist
        os.makedirs(Config.IMAGES_DIR, exist_ok=True)

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:1234@localhost:5432/anuvms'

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or \
        'postgresql://postgres:1234@localhost:5432/anuvms'

class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:1234@localhost:5432/anuvms'

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}