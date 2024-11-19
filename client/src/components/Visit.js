import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styling/Visit.css';

const Visit = () => {
    const navigate = useNavigate(); // Initialize navigate here

    // Placeholder data - these would typically be retrieved from the backend after fingerprint validation
    const userData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '123-456-7890',
        idNumber: 'ABC123',
        banned: null, // Change this value to test different statuses: null, true, false
        issues: 'Had an altercation with security on last visit',
    };

    const getBanStatus = () => {
        if (userData.banned === null || userData.banned === undefined) {
            return 'NA';
        } else if (userData.banned) {
            return 'Banned';
        } else {
            return 'Unbanned';
        }
    };

    const handleApproveVisit = () => {
        console.log("Visit approved for", userData.firstName);
    };

    return (
        <div className="visit-container">
            <div className="profile-section">
                <h2>Visitor Profile</h2>
                <p><strong>Ban Status: </strong>
                <div className={`status-banner ${getBanStatus().toLowerCase()}`}>
                    {getBanStatus()}
                </div></p>
                <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                <p><strong>Phone Number:</strong> {userData.phoneNumber}</p>
                <p><strong>ID Number:</strong> {userData.idNumber}</p>
                {userData.issues && (
                    <p className="issues"><strong>Issues:</strong> {userData.issues}</p>
                )}
                <button className="activity-button" onClick={() => navigate('/activity')}>View Activity</button>
            </div>

            <div className="visit-form-section">
                <h3>Visit Details</h3>
                <label>
                    Reason for Visit:
                    <input type="text" placeholder="Enter reason for visit" />
                </label>
                <button className="approve-button" onClick={handleApproveVisit}>
                    Approve Visit
                </button>
            </div>
        </div>
    );
};

export default Visit;
