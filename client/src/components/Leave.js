import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styling/Leave.css';

const Leave = () => {
    const navigate = useNavigate(); // Initialize navigate here

    // Placeholder data - typically retrieved from the backend
    const userData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '123-456-7890',
        idNumber: 'ABC123',
        checkInTime: '2023-11-15 09:00 AM',
        reasonForVisit: 'Guest Lecture',
        banned: false, // Change this to test different statuses
        incidents: 'None',
    };

    const [banStatus, setBanStatus] = useState(userData.banned);
    const [incident, setIncident] = useState('');

    const getBanStatusText = () => {
        return banStatus ? 'Banned' : 'Unbanned';
    };

    const toggleBanStatus = () => {
        setBanStatus(!banStatus);
    };

    const handleApproveLeave = () => {
        console.log("Leave approved for", userData.firstName);
        console.log("Incident:", incident);
        console.log("Ban Status:", getBanStatusText());
    };

    return (
        <div className="leave-container">
            <div className="profile-section">
                <h2>Visitor Profile</h2>
                <p><strong>Ban Status: </strong>
                    <div className={`status-banner ${getBanStatusText().toLowerCase()}`}>
                        {getBanStatusText()}
                    </div>
                </p>
                <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                <p><strong>Phone Number:</strong> {userData.phoneNumber}</p>
                <p><strong>ID Number:</strong> {userData.idNumber}</p>
                <p><strong>Check-In Time:</strong> {userData.checkInTime}</p>
                <p><strong>Reason for Visit:</strong> {userData.reasonForVisit}</p>
                <p><strong>Incident Status:</strong> {userData.incidents}</p>
                <button className="activity-button" onClick={() => navigate('/activity')}>View Activity</button>
            </div>

            <div className="leave-form-section">
                <h3>Leave Details</h3>
                <label>
                    Incident (if any):
                    <input
                        type="text"
                        placeholder="Describe any incident"
                        value={incident}
                        onChange={(e) => setIncident(e.target.value)}
                    />
                </label>
                <button id = "test"
                    className={`approve-button ${banStatus ? 'banned' : 'unbanned'}`}
                    onClick={toggleBanStatus}
                >
                    {banStatus ? 'Unban Visitor' : 'Ban Visitor'}
                </button>
                <button id = "test" className="approve-button" onClick={handleApproveLeave}>
                    Approve Leave
                </button>
            </div>
        </div>
    );
};

export default Leave;
