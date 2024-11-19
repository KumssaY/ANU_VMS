import React, { useState } from 'react';
import './styling/Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        idNumber: '',
        fingerprint: '', // Placeholder for fingerprint input
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // For now, log the formData to check inputs (later, this will be sent to the backend)
        console.log(formData);
    };

    return (
        <div className="register-container">
            <h2>User Registration</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="idNumber"
                    placeholder="ID Number"
                    value={formData.idNumber}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="fingerprint"
                    placeholder="Fingerprint Data (Placeholder)"
                    value={formData.fingerprint}
                    onChange={handleChange}
                    required
                />
                <button type="submit" className="register-button">Register</button>
            </form>
        </div>
    );
};

export default Register;
