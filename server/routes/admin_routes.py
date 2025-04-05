# routes/admin_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from controllers.admin_controller import (
    get_all_security_personnel,
    get_security_personnel,
    get_security_personnel_activities,
    get_all_visitors,
    get_visitor,
    get_visitor_visits,
    get_visitor_bans,
    get_visitor_incidents,
    get_all_visits,
    get_all_incidents,
    get_all_bans,
    get_admin_dashboard_summary
)
from utils.auth import is_admin

admin_bp = Blueprint("admin", __name__)

# Security Personnel Routes
@admin_bp.route("/security-personnel", methods=["GET"])
@jwt_required()
def get_all_security_personnel_route():
    """Get all security personnel with pagination"""
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_all_security_personnel(page, per_page)

@admin_bp.route("/security-personnel/<uuid:security_uuid>", methods=["GET"])
@jwt_required()
def get_security_personnel_route(security_uuid):
    """Get a single security personnel by UUID"""
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    
    return get_security_personnel(security_uuid)

@admin_bp.route("/security-personnel/<uuid:security_uuid>/activities/<activity_type>", methods=["GET"])
@jwt_required()
def get_security_personnel_activities_route(security_uuid, activity_type):
    """Get activities of a security personnel by UUID and activity type"""
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_security_personnel_activities(security_uuid, activity_type, page, per_page)

# Visitor Routes
@admin_bp.route("/visitors", methods=["GET"])
@jwt_required()
def get_all_visitors_route():
    """Get all visitors with pagination"""
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_all_visitors(page, per_page)

@admin_bp.route("/visitors/<uuid:visitor_uuid>", methods=["GET"])
@jwt_required()
def get_visitor_route(visitor_uuid):
    """Get a single visitor by UUID"""
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    
    return get_visitor(visitor_uuid)

@admin_bp.route("/visitors/<uuid:visitor_uuid>/visits", methods=["GET"])
@jwt_required()
def get_visitor_visits_route(visitor_uuid):
    """Get all visits of a visitor by UUID"""
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_visitor_visits(visitor_uuid, page, per_page)

@admin_bp.route("/visitors/<uuid:visitor_uuid>/bans", methods=["GET"])
@jwt_required()
def get_visitor_bans_route(visitor_uuid):
    """Get all bans of a visitor by UUID"""
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_visitor_bans(visitor_uuid, page, per_page)

@admin_bp.route("/visitors/<uuid:visitor_uuid>/incidents", methods=["GET"])
@jwt_required()
def get_visitor_incidents_route(visitor_uuid):
    """Get all incidents of a visitor by UUID"""
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_visitor_incidents(visitor_uuid, page, per_page)

# All Records Routes
@admin_bp.route("/visits", methods=["GET"])
@jwt_required()
def get_all_visits_route():
    """Get all visits with pagination"""
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_all_visits(page, per_page)

@admin_bp.route("/incidents", methods=["GET"])
@jwt_required()
def get_all_incidents_route():
    """Get all incidents with pagination"""
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    return get_all_incidents(page, per_page)

@admin_bp.route("/bans", methods=["GET"])
@jwt_required()
def get_all_bans_route():
    """Get all bans with pagination"""
    if not is_admin():
        return jsonify({"error": "Access denied. Admins only."}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    active_only = request.args.get('active_only', False, type=bool)
    
    return get_all_bans(page, per_page, active_only)

# Admin Dashboard Summary Route
admin_bp.route('/dashboard/summary', methods=['GET'])(get_admin_dashboard_summary)