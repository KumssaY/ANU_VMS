#utils/auth.py
import os
import base64
import hashlib
from cryptography.fernet import Fernet
from flask import current_app, g
from flask_jwt_extended import get_jwt_identity
from werkzeug.local import LocalProxy
from models.user import SecurityPersonnel, UserRole
from extensions import db

def get_encryption_key():
    """Generate a consistent encryption key"""
    key = os.environ.get('ENCRYPTION_KEY', current_app.config['SECRET_KEY'])
    return base64.urlsafe_b64encode(hashlib.sha256(key.encode()).digest())

def encrypt_id(text):
    """Encrypt sensitive ID information"""
    cipher = Fernet(get_encryption_key())
    return cipher.encrypt(text.encode()).decode()

def decrypt_id(encrypted_text):
    """Decrypt encrypted ID information"""
    cipher = Fernet(get_encryption_key())
    return cipher.decrypt(encrypted_text.encode()).decode()

def verify_secret_code(secret_code):
    """
    Verify if the given secret code matches any SecurityPersonnel's secret code.
    
    Args:
        secret_code (str): The secret code to verify
    
    Returns:
        tuple: (is_valid, security_person) 
               - is_valid (bool): Whether the secret code is valid
               - security_person (SecurityPersonnel or None): The matched security personnel
    """
    if not secret_code:
        return False, None

    security_personnel = SecurityPersonnel.query.filter(
        SecurityPersonnel.secret_code_hash.isnot(None)
    ).all()

    for person in security_personnel:
        if person.check_secret_code(secret_code):
            return True, person
    
    return False, None


def get_current_user():
    """Get user from JWT token"""
    from models.user import User
    
    if hasattr(g, 'current_user'):
        return g.current_user

    user_id = get_jwt_identity()
    if not user_id:
        return None

    user = User.query.filter_by(uuid=user_id).first()
    if user:
        g.current_user = user
        return user
    return None

current_user = LocalProxy(get_current_user)

def is_admin():
    """Check if user is an Admin"""
    user = get_current_user()
    return user and user.role == UserRole.ADMIN

def is_security():
    """Check if user is Security Personnel"""
    user = get_current_user()
    return user and (user.role == UserRole.SECURITY or user.role == UserRole.ADMIN)