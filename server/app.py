# app.py - Entry point for the application

import os
from flask import Flask
from config import config
from extensions import db, jwt
from models.user import User, SecurityPersonnel, Admin, UserRole
from models.visit import Visit, VisitStatus
from models.ban import Ban
from models.incident import Incident
from routes.auth_routes import auth_bp
from routes.visitor_routes import visitor_bp
from routes.security_routes import security_bp
from routes.admin_routes import admin_bp
from routes.visit_routes import visit_bp

def create_app(config_name="development"):
    """Initialize and configure the Flask app."""
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize database
    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(visitor_bp, url_prefix='/api/visitors')
    app.register_blueprint(security_bp, url_prefix='/api/security')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(visit_bp, url_prefix='/api/visits')

    # Initialize database tables and create default admin
    with app.app_context():
        db.create_all()
        create_admin_if_not_exists()

    return app

def create_admin_if_not_exists():
    """Ensure a default admin account exists."""
    admin = Admin.query.filter_by(role=UserRole.ADMIN).first()

    if not admin:
        admin = Admin(
            first_name="System",
            last_name="Admin",
            email="admin@example.com",  # Change this to a valid email
            phone_number="1234567890",  # Ensure a phone number is provided
            role=UserRole.ADMIN
        )
        admin.set_password("Admin@123")  # Ensure a secure default password

        # Encrypt the national ID before storing
        admin.set_national_id("213125554")

        db.session.add(admin)
        db.session.commit()
        print("✅ Default admin account created.")
    else:
        print("✅ Admin already exists.")

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
