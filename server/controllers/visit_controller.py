# controllers/visit_controller.py - Handles visit-related logic

from flask import jsonify
from utils.auth import verify_secret_code
from models.visit import Visit, VisitStatus
from models.user import Visitor
from models.incident import Incident
from models.ban import Ban
from extensions import db
from sqlalchemy.orm import joinedload
from datetime import datetime

class VisitController:

    @staticmethod
    def create_visit(data):
        """
        Records a visitor entering using UUID.
        """
        # Verify security code
        is_valid, security_guard = verify_secret_code(data.get("secret_code"))
        if not is_valid:
            return jsonify({"success": False, "message": "Invalid security code"}), 403

        # Fetch visitor by UUID
        visitor = Visitor.query.filter(Visitor.uuid == data.get("visitor_id")).first()
        if not visitor:
            return jsonify({"success": False, "message": "Visitor not found"}), 404

        # Check if visitor is banned
        if visitor.is_banned:
            return jsonify({"success": False, "message": "This visitor is banned from entering"}), 403

        # Check if visitor already has an active visit
        active_visit = Visit.query.filter_by(visitor_id=visitor.id, status=VisitStatus.VISIT).first()
        if active_visit:
            return jsonify({"success": False, "message": "Visitor already has an active visit"}), 400

        # Create visit
        new_visit = Visit(
            visitor_id=visitor.id,
            reason=data.get("reason"),
            status=VisitStatus.VISIT,
            approved_by_id=security_guard.id
        )

        db.session.add(new_visit)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Visit recorded",
            "visit": new_visit.to_dict()
        }), 201


    @staticmethod
    def mark_leave(data):
        """
        Marks a visitor as leaving using the visit ID.
        """
        # Verify security code
        is_valid, security_guard = verify_secret_code(data.get("secret_code"))
        if not is_valid:
            return jsonify({"success": False, "message": "Invalid security code"}), 403

        visit_id = data.get("visit_id")
        if not visit_id:
            return jsonify({"success": False, "message": "Visit ID is required"}), 400

        # Fetch visit directly
        visit = Visit.query.filter_by(id=visit_id).first()
        if not visit:
            return jsonify({"success": False, "message": "Visit not found"}), 404

        # Check if already marked as left
        if visit.status == VisitStatus.LEAVE:
            return jsonify({"success": False, "message": "Visitor has already left"}), 400

        # Mark as left
        visit.status = VisitStatus.LEAVE
        visit.leave_time = datetime.utcnow()
        visit.left_approved_by_id = security_guard.id

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Visitor marked as left",
            "visit": visit.to_dict()
        }), 200
    
    @staticmethod
    def get_visit(visit_id):
        """
        Fetch a single visit by ID with full details.
        """
        visit = Visit.query.options(
            db.joinedload(Visit.visitor),
            db.joinedload(Visit.approved_by),
            db.joinedload(Visit.left_approved_by)
        ).get(visit_id)

        if not visit:
            return jsonify({"success": False, "message": "Visit not found"}), 404

        # Fetch incidents separately (since eager loading isn't supported)
        incidents = Incident.query.filter_by(visit_id=visit_id).all()

        # Convert visit details to dictionary
        result = visit.to_dict()
        result["visitor"] = visit.visitor.to_dict() if visit.visitor else None
        result["approved_by"] = visit.approved_by.to_dict() if visit.approved_by else None
        result["left_approved_by"] = visit.left_approved_by.to_dict() if visit.left_approved_by else None
        result["incidents"] = [inc.to_dict() for inc in incidents] if incidents else []

        return jsonify({
            "success": True,
            "visit": result
        }), 200

    @staticmethod
    def get_visitor_visits_detailed(visitor_uuid, page=1, per_page=50, include_relations=False):
        """
        Fetch detailed visits for a specific visitor using UUID.
        """
        # Validate visitor exists by UUID
        visitor = Visitor.query.filter_by(uuid=visitor_uuid).first()
        if not visitor:
            return jsonify({"success": False, "message": "Visitor not found"}), 404

        # Base query
        query = Visit.query.filter_by(visitor_id=visitor.id)

        if include_relations:
            query = query.options(
                joinedload(Visit.approved_by),
                joinedload(Visit.left_approved_by),
                joinedload(Visit.location),
                joinedload(Visit.host),
                joinedload(Visit.incidents).joinedload(Incident.reported_by)
            )

        # Apply pagination
        visits_paginated = query.order_by(Visit.visit_time.desc()).paginate(page=page, per_page=per_page)

        visit_list = []
        for visit in visits_paginated.items:
            visit_data = visit.to_dict()

            if include_relations:
                # Approver details
                visit_data["approved_by"] = visit.approved_by.to_dict() if visit.approved_by else None
                visit_data["left_approved_by"] = visit.left_approved_by.to_dict() if visit.left_approved_by else None
                
                # Host details
                visit_data["host"] = visit.host.to_dict() if visit.host else None

                # Location details
                visit_data["location"] = visit.location.to_dict() if visit.location else None

                # Incident details
                incidents = []
                for incident in visit.incidents:
                    incident_data = incident.to_dict()
                    incident_data["reported_by"] = incident.reported_by.to_dict() if incident.reported_by else None
                    incidents.append(incident_data)

                visit_data["incidents"] = incidents if incidents else []

            visit_list.append(visit_data)

        return jsonify({
            "success": True,
            "visitor_uuid": visitor_uuid,
            "visitor": visitor.to_dict(),
            "visits": visit_list,
            "pagination": {
                "current_page": page,
                "per_page": per_page,
                "total_pages": visits_paginated.pages,
                "total_visits": visits_paginated.total,
                "has_next": visits_paginated.has_next,
                "has_prev": visits_paginated.has_prev
            }
        }), 200

    @staticmethod
    def get_all_visits(visitor_uuid, page=1, per_page=50):
        """
        Fetch paginated visits for a visitor using their UUID.
        Includes detailed visit information.
        """
        # Validate visitor exists using UUID
        visitor = Visitor.query.filter_by(uuid=visitor_uuid).first()
        if not visitor:
            return jsonify({"success": False, "message": "Visitor not found"}), 404

        # Get visit history
        visits = Visit.query.filter_by(visitor_id=visitor.id).order_by(Visit.visit_time.desc()).paginate(page=page, per_page=per_page)

        # Fetch bans and incidents for this visitor
        active_bans = Ban.query.filter_by(visitor_id=visitor.id, lifted_at=None).all()
        past_incidents = Incident.query.filter_by(visitor_id=visitor.id).order_by(Incident.recorded_at.desc()).all()

        return jsonify({
            "success": True,
            "visitor": {
                "uuid": visitor.uuid,
                "name": f"{visitor.first_name} {visitor.last_name}",
                "phone_number": visitor.phone_number,
                "national_id": visitor.national_id,
                "is_banned": visitor.is_banned,
                "image_path": visitor.image_path,
            },
            "visits": [
                {
                    "id": visit.id,
                    "reason": visit.reason,
                    "visit_time": visit.visit_time.isoformat() if visit.visit_time else None,
                    "leave_time": visit.leave_time.isoformat() if visit.leave_time else None,
                    "duration": str(visit.duration()) if visit.duration() else "Ongoing",
                    "status": visit.status.value,
                    "approved_by": visit.approved_by.to_dict() if visit.approved_by else None,
                    "left_approved_by": visit.left_approved_by.to_dict() if visit.left_approved_by else None,
                    "incidents": [
                        {
                            "id": incident.id,
                            "description": incident.description,
                            "recorded_by": incident.recorded_by.to_dict() if incident.recorded_by else None,
                            "recorded_at": incident.recorded_at.isoformat() if incident.recorded_at else None,
                        }
                        for incident in visit.incidents
                    ],
                }
                for visit in visits.items
            ],
            "active_bans": [
                {
                    "id": ban.id,
                    "reason": ban.reason,
                    "issued_by": ban.issued_by.to_dict() if ban.issued_by else None,
                    "issued_at": ban.issued_at.isoformat() if ban.issued_at else None,
                }
                for ban in active_bans
            ],
            "incidents": [
                {
                    "id": incident.id,
                    "description": incident.description,
                    "recorded_by": incident.recorded_by.to_dict() if incident.recorded_by else None,
                    "recorded_at": incident.recorded_at.isoformat() if incident.recorded_at else None,
                }
                for incident in past_incidents
            ],
            "pagination": {
                "current_page": page,
                "per_page": per_page,
                "total_pages": visits.pages,
                "total_items": visits.total,
            }
        }), 200