import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VisitorRegistration from './pages/VisitorRegistration';
import VisitorList from './pages/VisitorList';
import MemberList from './pages/MemberList';
import MemberProfile from './pages/MemberProfile';

// Utilizando React.FC (Functional Component) para tipar o componente principal
const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cadastro/visitantes" element={<VisitorRegistration />} />
                <Route path="/visitantes" element={<VisitorList />} />
                <Route path="/membros" element={<MemberList />} />
                <Route path="/membros/:id" element={<MemberProfile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;