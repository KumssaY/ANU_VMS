# utils/nationalid.py - Identify a visitor by their National ID

from models.user import Visitor
from flask import current_app
from extensions import db

def find_visitor_by_national_id(national_id):
    """
    Identify a visitor by their national ID.
    
    Args:
        national_id (str): The visitor's national ID (unencrypted input).
        
    Returns:
        dict or None: Visitor details if found, else None.
    """
    try:
        # Query the database for the visitor with this national ID
        visitor = Visitor.query.filter_by(national_id=national_id).first()
        
        if visitor:
            return {
                "id": visitor.id,
                "first_name": visitor.first_name,
                "last_name": visitor.last_name,
                "phone_number": visitor.phone_number,
                "national_id": visitor.national_id,
                "image_path": visitor.image_path,
                "is_banned": visitor.is_banned,
                "ban_reason": visitor.ban_reason if visitor.is_banned else None,
                "ban_status": "Banned" if visitor.is_banned else "Not Banned"
            }
        else:
            return None
    except Exception as e:
        current_app.logger.error(f"Error finding visitor by national ID: {str(e)}")
        return None
