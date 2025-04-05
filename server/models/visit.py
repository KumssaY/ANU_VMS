# models/visit.py - Visit models for the application

import enum
import datetime
from extensions import db

class VisitStatus(enum.Enum):
    VISIT = "visit"
    LEAVE = "leave"

class Visit(db.Model):
    __tablename__ = 'visits'
    
    id = db.Column(db.Integer, primary_key=True)
    visitor_id = db.Column(db.Integer, db.ForeignKey('visitors.id'), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    visit_time = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    leave_time = db.Column(db.DateTime, nullable=True)
    approved_by_id = db.Column(db.Integer, db.ForeignKey('security_personnel.id'), nullable=False)
    left_approved_by_id = db.Column(db.Integer, db.ForeignKey('security_personnel.id'), nullable=True)
    status = db.Column(db.Enum(VisitStatus), default=VisitStatus.VISIT, nullable=False)
    
    # Relationships
    visitor = db.relationship('Visitor', back_populates='visits')
    approved_by = db.relationship('SecurityPersonnel', foreign_keys=[approved_by_id], back_populates='approved_visits')
    left_approved_by = db.relationship('SecurityPersonnel', foreign_keys=[left_approved_by_id], back_populates='approved_leaves')
    incidents = db.relationship('Incident', back_populates='visit', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'visitor_id': self.visitor_id,
            'reason': self.reason,
            'visit_time': self.visit_time.isoformat() if self.visit_time else None,
            'leave_time': self.leave_time.isoformat() if self.leave_time else None,
            'approved_by_id': self.approved_by_id,
            'left_approved_by_id': self.left_approved_by_id,
            'status': self.status.value,
            'duration': str(self.leave_time - self.visit_time) if self.leave_time else None
        }
    
    def duration(self):
        if self.leave_time and self.visit_time:
            return self.leave_time - self.visit_time
        return None