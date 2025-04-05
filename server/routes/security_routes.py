# routes/security_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from controllers.security_controller import (
    get_security_profile,
    get_all_visitors,
    get_visitor,
    get_visitor_profile,
    get_visitor_visits,
    get_visitor_bans,
    get_visitor_incidents,
    get_visitor_ban_status,
    get_security_activities
)
from utils.auth import is_security, current_user
from models.user import SecurityPersonnel

security_bp = Blueprint("security", __name__)

@security_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_security_profile_route():
    """Get security personnel profile"""
    if not is_security():
        return jsonify({"error": "Access denied. Security personnel only."}), 403
    
    return get_security_profile(current_user.uuid)

@security_bp.route("/activities", methods=["GET"])
@jwt_required()
def get_security_activities_route():
    """Get security personnel activities"""
    if not is_security():
        return jsonify({"error": "Access denied. Security personnel only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_security_activities(current_user.uuid, page, per_page)

@security_bp.route("/visitors", methods=["GET"])
@jwt_required()
def get_all_visitors_route():
    """Get all visitors"""
    if not is_security():
        return jsonify({"error": "Access denied. Security personnel only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_all_visitors(page, per_page)

@security_bp.route("/visitors/<uuid:visitor_uuid>", methods=["GET"])
@jwt_required()
def get_visitor_route(visitor_uuid):
    """Get a specific visitor"""
    if not is_security():
        return jsonify({"error": "Access denied. Security personnel only."}), 403
    
    return get_visitor(visitor_uuid)

@security_bp.route("/visitors/<uuid:visitor_uuid>/profile", methods=["GET"])
@jwt_required()
def get_visitor_profile_route(visitor_uuid):
    """Get visitor profile details"""
    if not is_security():
        return jsonify({"error": "Access denied. Security personnel only."}), 403
    
    return get_visitor_profile(visitor_uuid)

@security_bp.route("/visitors/<uuid:visitor_uuid>/visits", methods=["GET"])
@jwt_required()
def get_visitor_visits_route(visitor_uuid):
    """Get visitor's visits"""
    if not is_security():
        return jsonify({"error": "Access denied. Security personnel only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_visitor_visits(visitor_uuid, page, per_page)

@security_bp.route("/visitors/<uuid:visitor_uuid>/bans", methods=["GET"])
@jwt_required()
def get_visitor_bans_route(visitor_uuid):
    """Get visitor's bans"""
    if not is_security():
        return jsonify({"error": "Access denied. Security personnel only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_visitor_bans(visitor_uuid, page, per_page)

@security_bp.route("/visitors/<uuid:visitor_uuid>/incidents", methods=["GET"])
@jwt_required()
def get_visitor_incidents_route(visitor_uuid):
    """Get visitor's incidents"""
    if not is_security():
        return jsonify({"error": "Access denied. Security personnel only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_visitor_incidents(visitor_uuid, page, per_page)

@security_bp.route("/visitors/<uuid:visitor_uuid>/ban-status", methods=["GET"])
@jwt_required()
def get_visitor_ban_status_route(visitor_uuid):
    """Check if a visitor is currently banned"""
    if not is_security():
        return jsonify({"error": "Access denied. Security personnel only."}), 403
    
    return get_visitor_ban_status(visitor_uuid)