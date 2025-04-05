from flask import request, jsonify
from models.user import Admin, SecurityPersonnel, Visitor, UserRole
from models.visit import Visit, VisitStatus
from models.ban import Ban
from models.incident import Incident
from extensions import db
from sqlalchemy import desc, func
from datetime import datetime, date

### 🚀 Helper Function: Fetch Full Data with Related Objects ###
def detailed_security_dict(security):
    """Returns a detailed dictionary representation of security personnel."""
    return {
        **security.to_dict(),  # Base attributes
        "approved_visits": [visit.to_dict() for visit in security.approved_visits.limit(5)],  # Latest 5 visits
        "approved_leaves": [visit.to_dict() for visit in security.approved_leaves.limit(5)],
        "recorded_incidents": [incident.to_dict() for incident in security.recorded_incidents.limit(5)],
        "issued_bans": [ban.to_dict() for ban in security.issued_bans.limit(5)],
        "lifted_bans": [ban.to_dict() for ban in security.lifted_bans.limit(5)],
    }

def detailed_visitor_dict(visitor):
    """Returns a detailed dictionary representation of a visitor."""
    return {
        **visitor.to_dict(),
        "visits": [visit.to_dict() for visit in visitor.visits.limit(5)],
        "bans": [ban.to_dict() for ban in visitor.bans.limit(5)],
        "incidents": [incident.to_dict() for incident in visitor.incidents.limit(5)],
    }

### 🚀 1. Get All Security Personnel (Detailed) ###
def get_all_security_personnel(page=1, per_page=10):
    """Get all security personnel with detailed data."""
    security_personnel = SecurityPersonnel.query.filter(
        SecurityPersonnel.role == UserRole.SECURITY
    ).paginate(page=page, per_page=per_page)

    return jsonify({
        "security_personnel": [detailed_security_dict(personnel) for personnel in security_personnel.items],
        "total": security_personnel.total,
        "pages": security_personnel.pages,
        "current_page": page
    }), 200

### 🚀 2. Get Single Security Personnel (Detailed) ###
def get_security_personnel(security_uuid):
    """Fetch a single security personnel by UUID with full details."""
    security = SecurityPersonnel.query.filter(SecurityPersonnel.uuid == str(security_uuid)).first()
    
    if not security:
        return jsonify({"error": "Security personnel not found"}), 404
    
    return jsonify(detailed_security_dict(security)), 200

### 🚀 3. Get Security Personnel Activities (More Detailed) ###
def get_security_personnel_activities(security_uuid, activity_type, page=1, per_page=10):
    """Fetch detailed security personnel activities."""
    security = SecurityPersonnel.query.filter(SecurityPersonnel.uuid == str(security_uuid)).first()
    
    if not security:
        return jsonify({"error": "Security personnel not found"}), 404

    activities = None
    if activity_type == "approved_visits":
        activities = security.approved_visits.order_by(desc(Visit.visit_time))
    elif activity_type == "approved_leaves":
        activities = security.approved_leaves.order_by(desc(Visit.leave_time))
    elif activity_type == "incidents":
        activities = security.recorded_incidents.order_by(desc(Incident.recorded_at))
    elif activity_type == "issued_bans":
        activities = security.issued_bans.order_by(desc(Ban.issued_at))
    elif activity_type == "lifted_bans":
        activities = security.lifted_bans.order_by(desc(Ban.lifted_at))
    else:
        return jsonify({"error": "Invalid activity type"}), 400

    activities_paginated = activities.paginate(page=page, per_page=per_page)

    return jsonify({
        "activities": [activity.to_dict() for activity in activities_paginated.items],
        "total": activities_paginated.total,
        "pages": activities_paginated.pages,
        "current_page": page
    }), 200

### 🚀 4. Get All Visitors (Detailed) ###
def get_all_visitors(page=1, per_page=10):
    """Get all visitors with additional details."""
    visitors = Visitor.query.paginate(page=page, per_page=per_page)

    return jsonify({
        "visitors": [detailed_visitor_dict(visitor) for visitor in visitors.items],
        "total": visitors.total,
        "pages": visitors.pages,
        "current_page": page
    }), 200

### 🚀 5. Get Single Visitor (Detailed) ###
def get_visitor(visitor_uuid):
    """Fetch a single visitor by UUID with full details."""
    visitor = Visitor.query.filter(Visitor.uuid == str(visitor_uuid)).first()
    
    if not visitor:
        return jsonify({"error": "Visitor not found"}), 404
    
    return jsonify(detailed_visitor_dict(visitor)), 200

### 🚀 6. Get Visitor Visits (Detailed) ###
def get_visitor_visits(visitor_uuid, page=1, per_page=10):
    """Fetch all visits of a visitor with details."""
    visitor = Visitor.query.filter(Visitor.uuid == str(visitor_uuid)).first()
    
    if not visitor:
        return jsonify({"error": "Visitor not found"}), 404
    
    visits = visitor.visits.order_by(desc(Visit.visit_time)).paginate(page=page, per_page=per_page)

    return jsonify({
        "visits": [visit.to_dict() for visit in visits.items],
        "total": visits.total,
        "pages": visits.pages,
        "current_page": page
    }), 200

### 🚀 7. Get Visitor Bans (Detailed) ###
def get_visitor_bans(visitor_uuid, page=1, per_page=10):
    """Fetch all bans of a visitor."""
    visitor = Visitor.query.filter(Visitor.uuid == str(visitor_uuid)).first()
    
    if not visitor:
        return jsonify({"error": "Visitor not found"}), 404
    
    bans = visitor.bans.order_by(desc(Ban.issued_at)).paginate(page=page, per_page=per_page)

    return jsonify({
        "bans": [ban.to_dict() for ban in bans.items],
        "total": bans.total,
        "pages": bans.pages,
        "current_page": page
    }), 200

### 🚀 8. Get Visitor Incidents (Detailed) ###
def get_visitor_incidents(visitor_uuid, page=1, per_page=10):
    """Fetch all incidents of a visitor."""
    visitor = Visitor.query.filter(Visitor.uuid == str(visitor_uuid)).first()
    
    if not visitor:
        return jsonify({"error": "Visitor not found"}), 404
    
    incidents = visitor.incidents.order_by(desc(Incident.recorded_at)).paginate(page=page, per_page=per_page)

    return jsonify({
        "incidents": [incident.to_dict() for incident in incidents.items],
        "total": incidents.total,
        "pages": incidents.pages,
        "current_page": page
    }), 200

def get_all_visits(page=1, per_page=10):
    """Fetch all visits with detailed related data."""
    visits = Visit.query.order_by(desc(Visit.visit_time)).paginate(page=page, per_page=per_page)

    detailed_visits = []
    for visit in visits.items:
        # Visitor info
        visitor = visit.visitor.to_dict()

        # Approved by security personnel
        approved_by = visit.approved_by.to_dict() if visit.approved_by else None

        # Left approved by security personnel
        left_approved_by = visit.left_approved_by.to_dict() if visit.left_approved_by else None

        # Incidents related to this visit
        incidents = [incident.to_dict() for incident in visit.incidents]

        # Active or past bans related to this visitor
        bans = [ban.to_dict() for ban in visit.visitor.bans]

        detailed_visits.append({
            'id': visit.id,
            'reason': visit.reason,
            'visit_time': visit.visit_time.isoformat() if visit.visit_time else None,
            'leave_time': visit.leave_time.isoformat() if visit.leave_time else None,
            'status': visit.status.value,
            'duration': str(visit.duration()) if visit.duration() else None,

            'visitor': visitor,
            'approved_by': approved_by,
            'left_approved_by': left_approved_by,
            'incidents': incidents,
            'bans': bans
        })

    return jsonify({
        "visits": detailed_visits,
        "total": visits.total,
        "pages": visits.pages,
        "current_page": page
    }), 200

def get_all_incidents(page=1, per_page=10):
    """Fetch all incidents with detailed related data."""
    incidents = Incident.query.order_by(desc(Incident.recorded_at)).paginate(page=page, per_page=per_page)

    detailed_incidents = []
    for incident in incidents.items:
        detailed_incidents.append({
            'id': incident.id,
            'description': incident.description,
            'recorded_at': incident.recorded_at.isoformat() if incident.recorded_at else None,

            # Relationships
            'visitor': incident.visitor.to_dict() if incident.visitor else None,
            'visit': incident.visit.to_dict() if incident.visit else None,
            'recorded_by': incident.recorded_by.to_dict() if incident.recorded_by else None,
        })

    return jsonify({
        "incidents": detailed_incidents,
        "total": incidents.total,
        "pages": incidents.pages,
        "current_page": page
    }), 200

def get_admin_dashboard_summary():
    """Fetch summarized dashboard data for admin."""

    today = date.today()

    try:
        # 🔹 Total Visitors
        total_visitors = db.session.query(func.count(Visitor.id)).scalar() or 0

        # 🔹 Active Visits (Visits where leave_time is NULL)
        active_visits = db.session.query(func.count(Visit.id)).filter(Visit.leave_time.is_(None)).scalar() or 0

        # 🔹 Visits Today
        visits_today = db.session.query(func.count(Visit.id)).filter(func.date(Visit.visit_time) == today).scalar() or 0

        # 🔹 Incidents Today
        incidents_today = db.session.query(func.count(Incident.id)).filter(func.date(Incident.recorded_at) == today).scalar() or 0

        # 🔹 Active Bans (Bans where lifted_at is NULL)
        active_bans = db.session.query(func.count(Ban.id)).filter(Ban.lifted_at.is_(None)).scalar() or 0

        # 🔹 Security Personnel Count
        security_personnel_count = db.session.query(func.count(SecurityPersonnel.id)).scalar() or 0

        # 🔹 Total Visits (All time)
        total_visits = db.session.query(func.count(Visit.id)).scalar() or 0

        # 🔹 Total Incidents (All time)
        total_incidents = db.session.query(func.count(Incident.id)).scalar() or 0

        # 🔹 Total Bans (All time)
        total_bans = db.session.query(func.count(Ban.id)).scalar() or 0

        # 🔹 Most Frequent Visitors (Top 5 by visit count)
        frequent_visitors = db.session.query(
            Visitor.id, 
            Visitor.first_name, 
            Visitor.last_name, 
            func.count(Visit.id).label("visit_count")
        ).join(Visit).group_by(Visitor.id, Visitor.first_name, Visitor.last_name).order_by(func.count(Visit.id).desc()).limit(5).all()

        frequent_visitors_data = [
            {"id": v.id, "full_name": f"{v.first_name} {v.last_name}", "visit_count": v.visit_count} for v in frequent_visitors
        ]

        # 🔹 Most Recent Incidents (Last 5 incidents)
        recent_incidents = Incident.query.order_by(Incident.recorded_at.desc()).limit(5).all()
        recent_incidents_data = [incident.to_dict() for incident in recent_incidents]

        # 🔹 Most Recent Bans (Last 5 bans)
        recent_bans = Ban.query.order_by(Ban.issued_at.desc()).limit(5).all()
        recent_bans_data = [ban.to_dict() for ban in recent_bans]

        # 🔹 Most Recent Visits (Last 5 visits)
        recent_visits = Visit.query.order_by(Visit.visit_time.desc()).limit(5).all()
        recent_visits_data = [
            {
                "id": visit.id,
                "visitor_id": visit.visitor_id,
                "visitor_name": f"{visit.visitor.first_name} {visit.visitor.last_name}",
                "reason": visit.reason,
                "visit_time": visit.visit_time.isoformat(),
                "leave_time": visit.leave_time.isoformat() if visit.leave_time else None
            }
            for visit in recent_visits
        ]

        # 🔹 Construct Summary Response
        summary = {
            "total_visitors": total_visitors,
            "active_visits": active_visits,
            "visits_today": visits_today,
            "incidents_today": incidents_today,
            "active_bans": active_bans,
            "security_personnel_count": security_personnel_count,
            "total_visits": total_visits,
            "total_incidents": total_incidents,
            "total_bans": total_bans,
            "frequent_visitors": frequent_visitors_data,
            "recent_incidents": recent_incidents_data,
            "recent_bans": recent_bans_data,
            "recent_visits": recent_visits_data
        }

        return jsonify(summary), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_all_bans(page=1, per_page=10, active_only=False):
    """Fetch all bans with detailed related data, optionally filtering only active ones."""
    query = Ban.query
    if active_only:
        query = query.filter(Ban.lifted_at.is_(None))

    bans = query.order_by(desc(Ban.issued_at)).paginate(page=page, per_page=per_page)

    detailed_bans = []
    for ban in bans.items:
        detailed_bans.append({
            'id': ban.id,
            'reason': ban.reason,
            'issued_at': ban.issued_at.isoformat() if ban.issued_at else None,
            'lifted_at': ban.lifted_at.isoformat() if ban.lifted_at else None,
            'is_active': ban.lifted_at is None,

            # Relationships
            'visitor': ban.visitor.to_dict() if ban.visitor else None,
            'visit': Visit.query.get(ban.visit_id).to_dict() if ban.visit_id else None,
            'issued_by': ban.issued_by.to_dict() if ban.issued_by else None,
            'lifted_by': ban.lifted_by.to_dict() if ban.lifted_by else None,
        })

    return jsonify({
        "bans": detailed_bans,
        "total": bans.total,
        "pages": bans.pages,
        "current_page": page
    }), 200
