import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VisitorRegistration from './pages/VisitorRegistration';

// Utilizando React.FC (Functional Component) para tipar o componente principal
const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cadastro/visitantes" element={<VisitorRegistration />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;