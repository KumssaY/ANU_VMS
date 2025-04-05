# controllers/security_controller.py
from flask import request, jsonify
from models.user import SecurityPersonnel, Visitor, UserRole
from models.visit import Visit, VisitStatus
from models.ban import Ban
from models.incident import Incident
from extensions import db
from sqlalchemy import desc

def get_security_profile(security_uuid):
    """Get security personnel profile by UUID"""
    security = SecurityPersonnel.query.filter_by(uuid=security_uuid).first()
    
    if not security:
        return jsonify({"error": "Security personnel not found"}), 404
    
    return jsonify(security.to_dict()), 200

def get_all_visitors(page=1, per_page=10):
    """Get all visitors with pagination (for security personnel)"""
    visitors = Visitor.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        "visitors": [visitor.to_dict() for visitor in visitors.items],
        "total": visitors.total,
        "pages": visitors.pages,
        "current_page": page
    }), 200

def get_visitor(visitor_uuid):
    """Get a visitor by UUID (for security personnel)"""
    visitor_uuid_str = str(visitor_uuid)

    visitor = Visitor.query.filter_by(uuid=visitor_uuid_str).first()
    
    if not visitor:
        return jsonify({"error": "Visitor not found"}), 404
    
    return jsonify(visitor.to_dict()), 200

def get_visitor_profile(visitor_uuid):
    """Get visitor profile details by UUID"""
    visitor_uuid_str = str(visitor_uuid)

    visitor = Visitor.query.filter_by(uuid=visitor_uuid_str).first()
    
    if not visitor:
        return jsonify({"error": "Visitor not found"}), 404
    
    # Get visitor's current ban status
    active_ban = Ban.query.filter_by(visitor_id=visitor.id, lifted_at=None).first()
    
    result = visitor.to_dict()
    result["is_currently_banned"] = active_ban is not None
    
    if active_ban:
        result["active_ban"] = active_ban.to_dict()
    
    return jsonify(result), 200

def get_visitor_visits(visitor_uuid, page=1, per_page=10):
    """Get all visits of a visitor by UUID"""
    visitor_uuid_str = str(visitor_uuid)

    visitor = Visitor.query.filter_by(uuid=visitor_uuid_str).first()
    
    if not visitor:
        return jsonify({"error": "Visitor not found"}), 404
    
    visits = visitor.visits.order_by(desc(Visit.visit_time)).paginate(page=page, per_page=per_page)
    
    return jsonify({
        "visits": [visit.to_dict() for visit in visits.items],
        "total": visits.total,
        "pages": visits.pages,
        "current_page": page
    }), 200

def get_visitor_bans(visitor_uuid, page=1, per_page=10):
    """Get all bans of a visitor by UUID"""
    visitor_uuid_str = str(visitor_uuid)

    visitor = Visitor.query.filter_by(uuid=visitor_uuid_str).first()
    
    if not visitor:
        return jsonify({"error": "Visitor not found"}), 404
    
    bans = visitor.bans.order_by(desc(Ban.issued_at)).paginate(page=page, per_page=per_page)
    
    return jsonify({
        "bans": [ban.to_dict() for ban in bans.items],
        "total": bans.total,
        "pages": bans.pages,
        "current_page": page
    }), 200

def get_visitor_incidents(visitor_uuid, page=1, per_page=10):
    """Get all incidents of a visitor by UUID"""
    visitor_uuid_str = str(visitor_uuid)

    visitor = Visitor.query.filter_by(uuid=visitor_uuid_str).first()
    
    if not visitor:
        return jsonify({"error": "Visitor not found"}), 404
    
    incidents = visitor.incidents.order_by(desc(Incident.recorded_at)).paginate(page=page, per_page=per_page)
    
    return jsonify({
        "incidents": [incident.to_dict() for incident in incidents.items],
        "total": incidents.total,
        "pages": incidents.pages,
        "current_page": page
    }), 200

def get_visitor_ban_status(visitor_uuid):
    """Check if a visitor is currently banned"""
    visitor_uuid_str = str(visitor_uuid)

    visitor = Visitor.query.filter_by(uuid=visitor_uuid_str).first()
    
    if not visitor:
        return jsonify({"error": "Visitor not found"}), 404
    
    active_ban = Ban.query.filter_by(visitor_id=visitor.id, lifted_at=None).first()
    
    return jsonify({
        "is_banned": active_ban is not None,
        "ban_details": active_ban.to_dict() if active_ban else None
    }), 200

def get_security_activities(security_uuid, page=1, per_page=10):
    """Get all activities of a security personnel"""
    security_uuid_str = str(security_uuid)
    security = SecurityPersonnel.query.filter_by(uuid=security_uuid_str).first()
    
    if not security:
        return jsonify({"error": "Security personnel not found"}), 404
    
    # Get counts
    visits_count = security.approved_visits.count()
    leaves_count = security.approved_leaves.count()
    incidents_count = security.recorded_incidents.count()
    bans_issued_count = security.issued_bans.count()
    bans_lifted_count = security.lifted_bans.count()
    
    # Get recent activities
    recent_visits = security.approved_visits.order_by(desc(Visit.visit_time)).limit(5).all()
    recent_incidents = security.recorded_incidents.order_by(desc(Incident.recorded_at)).limit(5).all()
    
    return jsonify({
        "activity_counts": {
            "visits_approved": visits_count,
            "leaves_approved": leaves_count,
            "incidents_recorded": incidents_count,
            "bans_issued": bans_issued_count,
            "bans_lifted": bans_lifted_count
        },
        "recent_activities": {
            "recent_visits": [visit.to_dict() for visit in recent_visits],
            "recent_incidents": [incident.to_dict() for incident in recent_incidents]
        }
    }), 200