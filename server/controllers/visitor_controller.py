#controllers/visitor_controller.py
from flask import jsonify, request
from sqlalchemy.exc import IntegrityError
from utils.nationalid import find_visitor_by_national_id
from utils.auth import verify_secret_code
from utils.biometric import save_image, find_matching_visitor
from models.user import Visitor, SecurityPersonnel
from models.visit import Visit
from models.ban import Ban
from models.incident import Incident
from extensions import db
from datetime import datetime

class VisitorController:
    
    @staticmethod
    def register_visitor(data):
        """
        Handles visitor registration.
        """
        is_valid, security_guard = verify_secret_code(data.get("secret_code"))
        if not is_valid:
            return jsonify({"success": False, "message": "Invalid security code"}), 403

        # Check for existing visitor with same phone number or national ID
        existing_visitor = Visitor.query.filter(
            (Visitor.phone_number == data["phone_number"]) | 
            (Visitor.national_id == data["national_id"])
        ).first()

        if existing_visitor:
            return jsonify({
                "success": False, 
                "message": "A visitor with this phone number or national ID already exists"
            }), 400

        image_path = save_image(data["image_data"]) if data.get("image_data") else None

        try:
            new_visitor = Visitor(
                first_name=data["first_name"],
                last_name=data["last_name"],
                phone_number=data["phone_number"],
                national_id=data["national_id"],
                image_path=image_path
            )

            db.session.add(new_visitor)
            db.session.commit()

            return jsonify({
                "success": True, 
                "message": "Visitor registered successfully",
                "visitor_id": new_visitor.id
            }), 201

        except IntegrityError:
            db.session.rollback()
            return jsonify({
                "success": False, 
                "message": "A visitor with this phone number or national ID already exists"
            }), 400

    
    @staticmethod
    def identify_visitor(data):
        """
        Identifies a visitor by National ID or face image.
        """
        visitor_info = None

        if "national_id" in data:
            visitor_info = Visitor.query.filter_by(national_id=data["national_id"]).first()  # 🔴 FIX: Removed `.filter_by(is_banned=False)`

        elif "image_data" in data:
            image_path = save_image(data["image_data"])
            visitors = Visitor.query.all()
            best_match, _ = find_matching_visitor(image_path, visitors)
            if best_match:
                visitor_info = best_match.to_dict()

        if visitor_info:
            #  Include ban status & history
            response_data = visitor_info.to_dict()
            response_data["is_banned"] = visitor_info.is_banned

            if visitor_info.is_banned:
                last_ban = Ban.query.filter_by(visitor_id=visitor_info.id).order_by(Ban.issued_at.desc()).first()
                if last_ban:
                    response_data["ban_reason"] = last_ban.reason
                    response_data["banned_by"] = last_ban.issued_by_id  # Can replace with actual security officer name

            return jsonify({"success": True, "visitor": response_data}), 200
        
        return jsonify({"success": False, "message": "Visitor not found"}), 404

    
    @staticmethod
    def ban_visitor(data):
        """
        Bans a visitor using UUID.
        """
        visitor = Visitor.query.filter_by(uuid=data["visitor_id"]).first()
        is_valid, security_guard = verify_secret_code(data["secret_code"])

        if not visitor:
            return jsonify({"success": False, "message": "Visitor not found"}), 404
        if not is_valid:
            return jsonify({"success": False, "message": "Invalid security code"}), 403

        visitor.is_banned = True

        # Get visit_id if provided, otherwise set to None
        visit_id = data.get("visit_id")

        ban_record = Ban(
            visitor_id=visitor.id,
            visit_id=visit_id,
            reason=data["reason"],
            issued_by_id=security_guard.id
        )

        db.session.add(ban_record)
        db.session.commit()

        return jsonify({"success": True, "message": "Visitor banned successfully"}), 200

    @staticmethod
    def unban_visitor(data):
        """
        Unbans a visitor using UUID.
        """
        visitor = Visitor.query.filter_by(uuid=data["visitor_id"]).first()
        is_valid, security_guard = verify_secret_code(data["secret_code"])

        if not visitor:
            return jsonify({"success": False, "message": "Visitor not found"}), 404
        if not is_valid:
            return jsonify({"success": False, "message": "Invalid security code"}), 403

        visitor.is_banned = False

        # Find the active ban record
        active_ban = Ban.query.filter_by(visitor_id=visitor.id, lifted_at=None).first()
        if active_ban:
            active_ban.lifted_at = db.func.now()
            active_ban.lifted_by_id = security_guard.id

        db.session.commit()

        return jsonify({"success": True, "message": "Visitor unbanned successfully"}), 200

    @staticmethod
    def report_incident(data):
        """
        Reports an incident involving a visitor.
        """
        # Verify security code
        is_valid, security_guard = verify_secret_code(data.get("secret_code"))
        if not is_valid:
            return jsonify({"success": False, "message": "Invalid security code"}), 403

        # Find visitor by UUID
        visitor = Visitor.query.filter_by(uuid=data.get("visitor_id")).first()
        if not visitor:
            return jsonify({"success": False, "message": "Visitor not found"}), 404

        # Find the most recent visit of the visitor
        latest_visit = (
            Visit.query.filter_by(visitor_id=visitor.id)
            .order_by(Visit.visit_time.desc())
            .first()
        )

        if not latest_visit:
            return jsonify({"success": False, "message": "No active visit found for the visitor"}), 400

        # Create new incident
        new_incident = Incident(
            visitor_id=visitor.id,
            visit_id=latest_visit.id,
            description=data["incident_details"],
            recorded_by_id=security_guard.id,  # Security personnel ID
            recorded_at=datetime.utcnow(),
        )

        db.session.add(new_incident)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Incident reported successfully",
            "incident_id": new_incident.id
        }), 201

    @staticmethod
    def get_visitor_incidents(national_id):
        """
        Retrieves all incidents associated with a visitor by national ID.
        """
        visitor = Visitor.query.filter_by(national_id=national_id).first()
        if not visitor:
            return jsonify({"success": False, "message": "Visitor not found"}), 404

        incidents = Incident.query.filter_by(visitor_id=visitor.id).order_by(Incident.recorded_at.desc()).all()
        
        incident_list = [
            {
                "incident_id": incident.id,
                "visit_id": incident.visit_id,
                "description": incident.description,
                "recorded_by": incident.recorded_by_id,
                "recorded_at": incident.recorded_at.strftime("%Y-%m-%d %H:%M:%S")
            }
            for incident in incidents
        ]

        return jsonify({"success": True, "incidents": incident_list}), 200

    @staticmethod
    def get_incident_by_id(incident_id):
        """
        Retrieves a specific incident by its ID.
        """
        incident = Incident.query.get(incident_id)
        if not incident:
            return jsonify({"success": False, "message": "Incident not found"}), 404
        
        # Get visitor and security guard information
        visitor = Visitor.query.get(incident.visitor_id)
        security_personnel = SecurityPersonnel.query.get(incident.recorded_by_id)
        
        incident_data = incident.to_dict()
        
        # Add additional information
        if visitor:
            incident_data["visitor_name"] = f"{visitor.first_name} {visitor.last_name}"
        
        if security_personnel:
            incident_data["recorded_by_name"] = f"{security_personnel.first_name} {security_personnel.last_name}"
        
        return jsonify({"success": True, "incident": incident_data}), 200
    
    @staticmethod
    def get_last_visit(visitor_id=None, national_id=None):
        """
        Retrieves the last visit details for a visitor.
        Can search by visitor_id or national_id.
        """
        if not visitor_id and not national_id:
            return jsonify({"success": False, "message": "Must provide visitor_id or national_id"}), 400
        
        # Find the visitor
        visitor = None
        if visitor_id:
            visitor = Visitor.query.get(visitor_id)
        elif national_id:
            visitor = Visitor.query.filter_by(national_id=national_id).first()
        
        if not visitor:
            return jsonify({"success": False, "message": "Visitor not found"}), 404
        
        # Get the latest visit
        latest_visit = Visit.query.filter_by(visitor_id=visitor.id).order_by(Visit.visit_time.desc()).first()
        
        if not latest_visit:
            return jsonify({"success": False, "message": "No visits found for this visitor"}), 404
        
        # Get comprehensive visit details
        visit_data = latest_visit.to_dict()
        
        # Add visitor information
        visit_data["visitor"] = {
            "id": visitor.id,
            "name": f"{visitor.first_name} {visitor.last_name}",
            "phone_number": visitor.phone_number,
            "national_id": visitor.national_id,
            "is_banned": visitor.is_banned
        }
        
        # Add security personnel information
        if latest_visit.approved_by:
            approver = latest_visit.approved_by
            visit_data["approved_by"] = {
                "id": approver.id,
                "name": f"{approver.first_name} {approver.last_name}"
            }
        
        if latest_visit.left_approved_by:
            left_approver = latest_visit.left_approved_by
            visit_data["left_approved_by"] = {
                "id": left_approver.id,
                "name": f"{left_approver.first_name} {left_approver.last_name}"
            }
        
        # Add any incidents that occurred during this visit
        incidents = Incident.query.filter_by(visit_id=latest_visit.id).all()
        
        if incidents:
            visit_data["incidents"] = [incident.to_dict() for incident in incidents]
        else:
            visit_data["incidents"] = []
        
        return jsonify({"success": True, "visit": visit_data}), 200
    
    @staticmethod
    def get_all_bans_for_visitor(visitor_uuid):
        """
        Get all ban history (active & lifted) for a visitor by UUID.
        """
        visitor = Visitor.query.filter_by(uuid=visitor_uuid).first()
        if not visitor:
            return jsonify({"success": False, "message": "Visitor not found"}), 404

        bans = Ban.query.filter_by(visitor_id=visitor.id).order_by(Ban.issued_at.desc()).all()

        ban_history = []
        for ban in bans:
            security_officer = SecurityPersonnel.query.get(ban.issued_by_id)
            lifted_by = SecurityPersonnel.query.get(ban.lifted_by_id) if ban.lifted_by_id else None

            ban_info = {
                "ban_id": ban.id,
                "issued_at": ban.issued_at.strftime("%Y-%m-%d %H:%M:%S"),
                "reason": ban.reason,
                "issued_by": {
                    "id": security_officer.id,
                    "name": f"{security_officer.first_name} {security_officer.last_name}"
                } if security_officer else None,
                "lifted_at": ban.lifted_at.strftime("%Y-%m-%d %H:%M:%S") if ban.lifted_at else None,
                "lifted_by": {
                    "id": lifted_by.id,
                    "name": f"{lifted_by.first_name} {lifted_by.last_name}"
                } if lifted_by else None,
            }

            # Include visitor details
            ban_info["visitor"] = {
                "id": visitor.id,
                "uuid": visitor.uuid,
                "name": f"{visitor.first_name} {visitor.last_name}",
                "phone_number": visitor.phone_number,
                "national_id": visitor.national_id,
                "is_banned": visitor.is_banned
            }

            # Include visit details if applicable
            if ban.visit_id:
                visit = Visit.query.get(ban.visit_id)
                if visit:
                    ban_info["visit"] = {
                        "visit_id": visit.id,
                        "visit_time": visit.visit_time.strftime("%Y-%m-%d %H:%M:%S"),
                        "approved_by": visit.approved_by_id,
                        "left_at": visit.left_at.strftime("%Y-%m-%d %H:%M:%S") if visit.left_at else None
                    }

            ban_history.append(ban_info)

        return jsonify({"success": True, "ban_history": ban_history}), 200


    @staticmethod
    def get_current_ban_for_visitor(visitor_uuid):
        """
        Get the latest active ban for a visitor by UUID.
        Only returns a ban that has not been lifted.
        """
        visitor = Visitor.query.filter_by(uuid=visitor_uuid).first()
        if not visitor:
            return jsonify({"success": False, "message": "Visitor not found"}), 404

        active_ban = Ban.query.filter_by(visitor_id=visitor.id, lifted_at=None).order_by(Ban.issued_at.desc()).first()

        if not active_ban:
            return jsonify({"success": False, "message": "No active ban found for this visitor"}), 404

        security_officer = SecurityPersonnel.query.get(active_ban.issued_by_id)

        ban_info = {
            "ban_id": active_ban.id,
            "issued_at": active_ban.issued_at.strftime("%Y-%m-%d %H:%M:%S"),
            "reason": active_ban.reason,
            "issued_by": {
                "id": security_officer.id,
                "name": f"{security_officer.first_name} {security_officer.last_name}"
            } if security_officer else None,
        }

        # Include visitor details
        ban_info["visitor"] = {
            "id": visitor.id,
            "uuid": visitor.uuid,
            "name": f"{visitor.first_name} {visitor.last_name}",
            "phone_number": visitor.phone_number,
            "national_id": visitor.national_id,
            "is_banned": visitor.is_banned
        }

        # Include visit details if applicable
        if active_ban.visit_id:
            visit = Visit.query.get(active_ban.visit_id)
            if visit:
                ban_info["visit"] = {
                    "visit_id": visit.id,
                    "visit_time": visit.visit_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "approved_by": visit.approved_by_id,
                    "left_at": visit.left_at.strftime("%Y-%m-%d %H:%M:%S") if visit.left_at else None
                }

        return jsonify({"success": True, "current_ban": ban_info}), 200

    @staticmethod
    def get_ban_details(ban_id):
        """
        Get details of a specific ban by its ID.
        """
        ban = Ban.query.get(ban_id)
        if not ban:
            return jsonify({"success": False, "message": "Ban not found"}), 404

        visitor = Visitor.query.get(ban.visitor_id)
        security_officer = SecurityPersonnel.query.get(ban.issued_by_id)
        lifted_by = SecurityPersonnel.query.get(ban.lifted_by_id) if ban.lifted_by_id else None

        # Construct ban details response
        ban_details = {
            "ban_id": ban.id,
            "issued_at": ban.issued_at.strftime("%Y-%m-%d %H:%M:%S"),
            "reason": ban.reason,
            "issued_by": {
                "id": security_officer.id,
                "name": f"{security_officer.first_name} {security_officer.last_name}"
            } if security_officer else None,
            "lifted_at": ban.lifted_at.strftime("%Y-%m-%d %H:%M:%S") if ban.lifted_at else None,
            "lifted_by": {
                "id": lifted_by.id,
                "name": f"{lifted_by.first_name} {lifted_by.last_name}"
            } if lifted_by else None,
        }

        # Include visitor details
        if visitor:
            ban_details["visitor"] = {
                "id": visitor.id,
                "uuid": visitor.uuid,
                "name": f"{visitor.first_name} {visitor.last_name}",
                "phone_number": visitor.phone_number,
                "national_id": visitor.national_id,
                "is_banned": visitor.is_banned
            }

        # Include visit details if applicable
        if ban.visit_id:
            visit = Visit.query.get(ban.visit_id)
            if visit:
                ban_details["visit"] = {
                    "visit_id": visit.id,
                    "visit_time": visit.visit_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "approved_by": visit.approved_by_id,
                    "left_at": visit.left_at.strftime("%Y-%m-%d %H:%M:%S") if visit.left_at else None
                }

        return jsonify({"success": True, "ban_details": ban_details}), 200
