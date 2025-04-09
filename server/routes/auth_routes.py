# routes/auth_routes.py - Authentication Routes

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from controllers.auth_controller import (
    login,
    register_admin,
    register_security_personnel,
    update_security_code,
    deactivate_security_personnel,
    activate_security_personnel
)
from utils.auth import is_admin

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login_route():
    return login()

@auth_bp.route("/register/admin", methods=["POST"])
@jwt_required()
def register_admin_route():
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    return register_admin()

@auth_bp.route("/register/security", methods=["POST"])
@jwt_required()
def register_security_route():
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    return register_security_personnel()

@auth_bp.route("/security/update-code", methods=["PUT"])
@jwt_required()
def update_security_code_route():
    return update_security_code()

@auth_bp.route("/security/deactivate", methods=["PUT"])
@jwt_required()
def deactivate_security_route():
    return deactivate_security_personnel()

@auth_bp.route("/security/activate", methods=["PUT"])
@jwt_required()
def activate_security_route():
    return activate_security_personnel()