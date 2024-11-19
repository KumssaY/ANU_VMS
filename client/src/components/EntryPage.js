import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styling/EntryPage.css';

const EntryPage = () => {
    const navigate = useNavigate();

    return (
        <div className="entry-container">
            <h1>Visitor Management System</h1>
            <button className="register-button" id='register-button' onClick={() => navigate('/register')}>Register</button>
            <button className="visit-leave-button" onClick={() => navigate('/visit-leave')}>Visiting or Leaving</button>
        </div>
    );
};

export default EntryPage;
