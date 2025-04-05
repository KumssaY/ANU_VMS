from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from controllers.visitor_controller import VisitorController
from models.user import Visitor

visitor_bp = Blueprint("visitor", __name__)

# ✅ Register a new visitor
@visitor_bp.route("/register", methods=["POST"])
def register_visitor():
    """
    Register a new visitor.

    Request JSON:
    {
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "123456789",
        "national_id": "12345678",
        "image_data": "base64-encoded image",
        "secret_code": "SEC123"
    }
    """
    data = request.json

    try:
        # Check for existing visitor with same phone number
        existing_visitor = Visitor.query.filter_by(phone_number=data.get("phone_number")).first()
        if existing_visitor:
            return jsonify({
                "success": False, 
                "message": "A visitor with this phone number already exists"
            }), 400

        return VisitorController.register_visitor(data)
    except IntegrityError:
        return jsonify({
            "success": False, 
            "message": "A visitor with this phone number or national ID already exists"
        }), 400
    except Exception as e:
        return jsonify({
            "success": False, 
            "message": f"Registration failed: {str(e)}"
        }), 500

# ✅ Identify an existing visitor
@visitor_bp.route("/identify", methods=["POST"])
def identify_visitor():
    """
    Identify a visitor using either National ID or Face Image.

    Request JSON:
    {
        "national_id": "12345678"   # OR
        "image_data": "base64-encoded image"
    }
    """
    data = request.json
    return VisitorController.identify_visitor(data)

# ✅ Ban a visitor
@visitor_bp.route("/ban", methods=["POST"])
def ban_visitor():
    """
    Ban a visitor.

    Request JSON:
    {
        "visitor_id": "550e8400-e29b-41d4-a716-446655440000",
        "reason": "Misconduct",
        "secret_code": "SEC123",
        "visit_id": 123  # Optional
    }
    """
    data = request.json
    return VisitorController.ban_visitor(data)

# ✅ Unban a visitor
@visitor_bp.route("/unban", methods=["PUT"])
def unban_visitor():
    """
    Unban a visitor.

    Request JSON:
    {
        "visitor_id": "550e8400-e29b-41d4-a716-446655440000",
        "secret_code": "SEC123"
    }
    """
    data = request.json
    return VisitorController.unban_visitor(data)

@visitor_bp.route("/report-incident", methods=["POST"])
def report_incident():
    """
    Log an incident for a visitor.

    Request JSON:
    {
        "visitor_id": "b5d3f4e8-7e5a-11ed-a1eb-0242ac120002",
        "incident_details": "Security breach",
        "secret_code": "SEC123"
    }
    """
    data = request.json
    return VisitorController.report_incident(data)

# ✅ Get all incidents for a visitor by national ID
@visitor_bp.route("/incidents/<string:national_id>", methods=["GET"])
def get_visitor_incidents(national_id):
    """
    Get all incidents for a visitor by national ID.
    
    URL Parameter:
    national_id - The national ID of the visitor
    """
    return VisitorController.get_visitor_incidents(national_id)

# ✅ Get a specific incident by ID
@visitor_bp.route("/incident/<int:incident_id>", methods=["GET"])
def get_incident(incident_id):
    """
    Get details of a specific incident.
    
    URL Parameter:
    incident_id - The ID of the incident to retrieve
    """
    return VisitorController.get_incident_by_id(incident_id)

# ✅ Get the last visit details for a visitor by visitor ID
@visitor_bp.route("/<int:visitor_id>/last-visit", methods=["GET"])
def get_visitor_last_visit(visitor_id):
    """
    Get the last visit details for a visitor by visitor ID.
    
    URL Parameter:
    visitor_id - The ID of the visitor
    """
    return VisitorController.get_last_visit(visitor_id=visitor_id)

# ✅ Get the last visit details for a visitor by national ID
@visitor_bp.route("/last-visit/<string:national_id>", methods=["GET"])
def get_visitor_last_visit_by_national_id(national_id):
    """
    Get the last visit details for a visitor by national ID.
    
    URL Parameter:
    national_id - The national ID of the visitor
    """
    return VisitorController.get_last_visit(national_id=national_id)

# ✅ Get all ban history for a visitor
@visitor_bp.route("/bans/history/<string:visitor_uuid>", methods=["GET"])
def get_all_bans(visitor_uuid):
    """
    Get all bans for a visitor (both lifted and active).
    
    URL Parameter:
    visitor_uuid - The UUID of the visitor
    """
    return VisitorController.get_all_bans_for_visitor(visitor_uuid)


# ✅ Get the current active ban for a visitor
@visitor_bp.route("/bans/current/<string:visitor_uuid>", methods=["GET"])
def get_current_ban(visitor_uuid):
    """
    Get the latest active ban for a visitor (not lifted).
    
    URL Parameter:
    visitor_uuid - The UUID of the visitor
    """
    return VisitorController.get_current_ban_for_visitor(visitor_uuid)

# ✅ Get details of a specific ban
@visitor_bp.route("/bans/<int:ban_id>", methods=["GET"])
def get_ban(ban_id):
    """
    Get details of a specific ban by its ID.
    
    URL Parameter:
    ban_id - The ID of the ban to retrieve
    """
    return VisitorController.get_ban_details(ban_id)
