import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EntryPage from './components/EntryPage';
import Register from './components/Register';
import VisitLeave from './components/VisitLeave';
import Visit from './components/Visit';
import Activity from './components/Activity';
import Leave from './components/Leave';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<EntryPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/visit-leave" element={<VisitLeave />} />
            <Route path="/visit" element={<Visit />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/leave" element={<Leave/>}/>
        </Routes>
    </Router>
);

export default App;
