# models/incident.py - Incident model for the application

import datetime
from extensions import db

class Incident(db.Model):
    __tablename__ = 'incidents'
    
    id = db.Column(db.Integer, primary_key=True)
    visitor_id = db.Column(db.Integer, db.ForeignKey('visitors.id'), nullable=False)
    visit_id = db.Column(db.Integer, db.ForeignKey('visits.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    recorded_by_id = db.Column(db.Integer, db.ForeignKey('security_personnel.id'), nullable=False)
    recorded_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    visitor = db.relationship('Visitor', back_populates='incidents')
    visit = db.relationship('Visit', back_populates='incidents')
    recorded_by = db.relationship('SecurityPersonnel', back_populates='recorded_incidents')
    
    def to_dict(self):
        return {
            'id': self.id,
            'visitor_id': self.visitor_id,
            'visit_id': self.visit_id,
            'description': self.description,
            'recorded_by_id': self.recorded_by_id,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None
        }