# model/user.py
import enum
import uuid
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from cryptography.fernet import Fernet
import os

# Generate or load encryption key
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY") or Fernet.generate_key()
cipher = Fernet(ENCRYPTION_KEY)

class UserRole(enum.Enum):
    VISITOR = "visitor"
    SECURITY = "security"
    ADMIN = "admin"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    other_names = db.Column(db.String(100), nullable=True)
    phone_number = db.Column(db.String(15), unique=True, nullable=True) 
    role = db.Column(db.Enum(UserRole), nullable=False, index=True)  # Indexed for quick role-based filtering
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, index=True)
    
    __mapper_args__ = {
        'polymorphic_on': role,
        'polymorphic_identity': 'user'
    }
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'other_names': self.other_names,
            'phone_number': self.phone_number,
            'role': self.role.value,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Visitor(User):
    __tablename__ = 'visitors'
    
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    national_id = db.Column(db.String(256), unique=True, nullable=False, index=True)  # ✅ Ensured non-null & indexed
    image_path = db.Column(db.String(255), unique=True, nullable=True)
    is_banned = db.Column(db.Boolean, default=False, index=True)  # ✅ Indexed for frequent filtering

    # Relationships
    visits = db.relationship('Visit', back_populates='visitor', lazy='dynamic')
    bans = db.relationship('Ban', back_populates='visitor', lazy='dynamic')
    incidents = db.relationship('Incident', back_populates='visitor', lazy='dynamic')
    
    __mapper_args__ = {
        'polymorphic_identity': UserRole.VISITOR,
    }
    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'is_banned': self.is_banned,
            'image_path': self.image_path
        })
        return base_dict

class SecurityPersonnel(User):
    __tablename__ = 'security_personnel'
    
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    national_id_encrypted = db.Column(db.String(512), unique=True, nullable=False, index=True)  # ✅ Ensured non-null
    password_hash = db.Column(db.String(256), nullable=False)
    secret_code_hash = db.Column(db.String(256), nullable=True)  
    is_active = db.Column(db.Boolean, default=True, index=True)  

    # Relationships
    approved_registrations = db.relationship('Visitor', secondary='visitor_registrations', 
                                              lazy='dynamic', backref=db.backref('registered_by', lazy='dynamic'))
    approved_visits = db.relationship('Visit', foreign_keys='Visit.approved_by_id', 
                                       back_populates='approved_by', lazy='dynamic')
    approved_leaves = db.relationship('Visit', foreign_keys='Visit.left_approved_by_id', 
                                       back_populates='left_approved_by', lazy='dynamic')
    recorded_incidents = db.relationship('Incident', back_populates='recorded_by', lazy='dynamic')
    issued_bans = db.relationship('Ban', foreign_keys='Ban.issued_by_id', back_populates='issued_by', lazy='dynamic')
    lifted_bans = db.relationship('Ban', foreign_keys='Ban.lifted_by_id', back_populates='lifted_by', lazy='dynamic')

    __mapper_args__ = {
        'polymorphic_identity': UserRole.SECURITY,
    }

    # Secure national ID management
    def set_national_id(self, national_id):
        """Encrypt and store national ID securely."""
        self.national_id_encrypted = cipher.encrypt(national_id.encode()).decode()

    def get_national_id(self):
        """Decrypt and retrieve national ID."""
        return cipher.decrypt(self.national_id_encrypted.encode()).decode()

    # Secure secret code management
    def set_secret_code(self, code):
        """Hash and store secret code securely."""
        self.secret_code_hash = generate_password_hash(code)

    def check_secret_code(self, code):
        """Verify hashed secret code."""
        return check_password_hash(self.secret_code_hash, code)
    
    # Password management
    def set_password(self, password):
        """Hash and store password securely."""
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        """Verify hashed password."""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'email': self.email,
            'is_active': self.is_active,
        })
        return base_dict

class Admin(SecurityPersonnel):
    __mapper_args__ = {
        'polymorphic_identity': UserRole.ADMIN,
    }
    
    def to_dict(self):
        return super().to_dict()

# Association table for visitor registrations
visitor_registrations = db.Table('visitor_registrations',
    db.Column('visitor_id', db.Integer, db.ForeignKey('visitors.id'), primary_key=True),
    db.Column('security_id', db.Integer, db.ForeignKey('security_personnel.id'), primary_key=True),
    db.Column('registered_at', db.DateTime, default=datetime.datetime.utcnow, index=True)  # ✅ Indexed for better sorting
)
