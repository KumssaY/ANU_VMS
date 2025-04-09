# routes/visit_routes.py - Visit management API

from flask import Blueprint, request, jsonify
from controllers.visit_controller import VisitController
from utils.auth import verify_secret_code
from models.visit import Visit, VisitStatus
from extensions import db

visit_bp = Blueprint("visit", __name__)

# Create a visit
@visit_bp.route("/visit", methods=["POST"])
def create_visit():
    """
    Log a visitor's entry.

    Request JSON:
    {
        "visitor_id": 1,
        "reason": "Meeting with HR",
        "secret_code": "SEC123"
    }
    """
    data = request.json
    return VisitController.create_visit(data)


#Mark visitor as leaving
@visit_bp.route("/leave", methods=["PUT"])
def mark_leave():
    """
    Log a visitor's exit.

    Request JSON:
    {
        "visitor_id": 1,
        "secret_code": "SEC123"
    }
    """
    data = request.json
    return VisitController.mark_leave(data)

#Get a single visit by ID
@visit_bp.route("/visit/<int:visit_id>", methods=["GET"])
def get_visit(visit_id):
    """
    Fetch a single visit by ID with full details.

    Path Params:
    - visit_id (int): The ID of the visit to retrieve
    """
    return VisitController.get_visit(visit_id)


@visit_bp.route("/visitor/<string:visitor_uuid>/visits", methods=["GET"])
def get_visitor_visits(visitor_uuid):
    """
    Fetch all visits for a specific visitor by UUID with full details.

    Path Params:
    - visitor_uuid (string): The UUID of the visitor

    Query Params:
    - page (int, default=1)
    - per_page (int, default=50)
    - include_relations (bool, default=False): Whether to include related data
    """
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)
    include_relations = request.args.get("include_relations", False, type=bool)
    
    return VisitController.get_visitor_visits_detailed(visitor_uuid, page, per_page, include_relations)

@visit_bp.route("/visits", methods=["GET"])
def get_all_visits():
    """
    Fetch paginated visits for a visitor using their UUID.

    Query Params:
    - visitor_uuid (str) [Required]: The unique identifier for the visitor.
    - page (int, default=1): The page number for pagination.
    - per_page (int, default=50): The number of results per page.
    """
    visitor_uuid = request.args.get("visitor_uuid", type=str)
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)

    if not visitor_uuid:
        return jsonify({"success": False, "message": "visitor_uuid is required"}), 400

    return VisitController.get_all_visits(visitor_uuid, page, per_page)