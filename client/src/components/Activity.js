import React from 'react';
import './styling/Activity.css';


// Register the necessary components with Chart.js

const Activity = () => {
    const visitHistory = [
        {
            date: '2023-11-01',
            entryTime: '09:00 AM',
            leaveTime: '03:00 PM',
            totalTime: 6,
            visitorName: 'John Doe',
            reason: 'Guest Lecture',
            approvingOfficer: 'Officer Smith',
        },
        {
            date: '2023-11-03',
            entryTime: '10:00 AM',
            leaveTime: '01:00 PM',
            totalTime: 3,
            visitorName: 'John Doe',
            reason: 'Library Visit',
            approvingOfficer: 'Officer Brown',
        },
        // Add more visits as needed
    ];

    // Prepare data for the bar chart
    const chartData = {
        labels: visitHistory.map(visit => visit.date),
        datasets: [
            {
                label: 'Time Spent in School (Hours)',
                data: visitHistory.map(visit => visit.totalTime),
                backgroundColor: '#FAC823', // Yellow color for bars
                borderColor: '#FF0000', // Red border color for bars
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="activity-container">
            <h2>Visitor Activity Report</h2>

            {/* Visit History Table */}
            <div className="table-container">
                <table className="activity-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Entry Time</th>
                            <th>Leave Time</th>
                            <th>Total Time (hrs)</th>
                            <th>Visitor Name</th>
                            <th>Reason for Visit</th>
                            <th>Approving Officer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visitHistory.map((visit, index) => (
                            <tr key={index}>
                                <td>{visit.date}</td>
                                <td>{visit.entryTime}</td>
                                <td>{visit.leaveTime}</td>
                                <td>{visit.totalTime}</td>
                                <td>{visit.visitorName}</td>
                                <td>{visit.reason}</td>
                                <td>{visit.approvingOfficer}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Time Spent Graph */}
            <div className="chart-container">
                
            </div>
        </div>
    );
};

export default Activity;
