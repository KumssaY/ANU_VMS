# models/ban.py - Ban model for the application

import datetime
from extensions import db

class Ban(db.Model):
    __tablename__ = 'bans'
    
    id = db.Column(db.Integer, primary_key=True)
    visitor_id = db.Column(db.Integer, db.ForeignKey('visitors.id'), nullable=False)
    visit_id = db.Column(db.Integer, db.ForeignKey('visits.id'), nullable=True)

    reason = db.Column(db.Text, nullable=False)
    issued_by_id = db.Column(db.Integer, db.ForeignKey('security_personnel.id'), nullable=False)
    issued_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    lifted_at = db.Column(db.DateTime, nullable=True)
    lifted_by_id = db.Column(db.Integer, db.ForeignKey('security_personnel.id'), nullable=True)
    
    # Relationships
    visitor = db.relationship('Visitor', back_populates='bans')
    issued_by = db.relationship('SecurityPersonnel', foreign_keys=[issued_by_id], back_populates='issued_bans')
    lifted_by = db.relationship('SecurityPersonnel', foreign_keys=[lifted_by_id], back_populates='lifted_bans')
    
    def to_dict(self):
        return {
            'id': self.id,
            'visitor_id': self.visitor_id,
            'reason': self.reason,
            'issued_at': self.issued_at.isoformat() if self.issued_at else None,
            'lifted_at': self.lifted_at.isoformat() if self.lifted_at else None,
            'issued_by_id': self.issued_by_id,
            'lifted_by_id': self.lifted_by_id,
            'is_active': self.lifted_at is None
        }
