# controllers/auth_controller.py - Authentication Logic

import os
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity
from models.user import Admin, SecurityPersonnel, UserRole
from extensions import db
from utils.auth import encrypt_id, verify_secret_code, is_admin

def login():
    """Login Security Personnel or Admin"""
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = SecurityPersonnel.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=user.uuid)
    return jsonify({"access_token": access_token, "role": user.role.value})

def register_admin():
    """Register a new Admin (Admins Only)"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = {"first_name", "last_name", "email", "password", "phone_number", "national_id"}
    if not required_fields.issubset(data.keys()):
        return jsonify({"error": "Missing required fields"}), 400

    # Check if admin with the same email already exists
    if Admin.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Admin already exists with this email"}), 400

    # Create admin user
    admin = Admin(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        phone_number=data["phone_number"],
        role=UserRole.ADMIN
    )
    
    # Set password
    admin.set_password(data["password"])

    # Encrypt and store National ID
    admin.set_national_id(data["national_id"])

    # Save to database
    db.session.add(admin)
    db.session.commit()

    return jsonify({"message": "Admin registered successfully"}), 201

def register_security_personnel():
    """Register a new Security Personnel (Admins Only)"""
    data = request.get_json()
    
    if not all(key in data for key in ("first_name", "last_name", "email", "password", "phone_number", "national_id")):
        return jsonify({"error": "Missing required fields"}), 400
    
    if SecurityPersonnel.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Security personnel already exists with this email"}), 400

    security = SecurityPersonnel(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        phone_number=data["phone_number"],
        role=UserRole.SECURITY
    )
    security.set_password(data["password"])
    security.set_national_id(data["national_id"])  # Encrypt national ID

    # ✅ Allow manual security code if provided
    if "secret_code" in data and data["secret_code"]:
        security.set_secret_code(data["secret_code"])

    db.session.add(security)
    db.session.commit()

    return jsonify({"message": "Security personnel registered successfully"}), 201

def update_security_code():
    """Allow a security personnel to update their own security code or an admin to update any security personnel's code."""
    data = request.get_json()
    email = data.get("email")
    new_code = data.get("new_code")

    if not email or not new_code:
        return jsonify({"error": "Email and new code are required"}), 400

    # Get logged-in user's UUID instead of email
    current_user_uuid = get_jwt_identity()
    print("JWT Identity:", current_user_uuid)

    # Fetch user using UUID instead of email
    current_user = SecurityPersonnel.query.filter_by(uuid=current_user_uuid).first()

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    # If security personnel, they can only update their own code
    if current_user.role == UserRole.SECURITY:
        if current_user.email != email:
            return jsonify({"error": "Access denied. You can only update your own security code."}), 403
        current_user.set_secret_code(new_code)

    # If admin, they can update any security personnel's code
    elif current_user.role == UserRole.ADMIN:
        target_user = SecurityPersonnel.query.filter_by(email=email, role=UserRole.SECURITY).first()
        if not target_user:
            return jsonify({"error": "Security personnel not found"}), 404
        target_user.set_secret_code(new_code)
    
    try:
        db.session.commit()
        return jsonify({"message": "Security code updated successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    
def deactivate_security_personnel():
    """Admin can deactivate a Security Personnel using their email instead of national ID."""
    
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403

    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    # Find security personnel by email
    target_user = SecurityPersonnel.query.filter_by(email=email).first()

    if not target_user:
        return jsonify({"error": "Security personnel not found"}), 404

    # Mark as inactive instead of deleting
    target_user.is_active = False

    try:
        db.session.commit()
        return jsonify({"message": "Security personnel deactivated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
