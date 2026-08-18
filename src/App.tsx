import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VisitorRegistration from './pages/VisitorRegistration';
import VisitorList from './pages/VisitorList';
import MemberList from './pages/MemberList';
import MemberProfile from './pages/MemberProfile';
import UserProfile from './pages/UserProfile';
import MinistryManagement from './pages/MinistryManagement';
import GroupManagement from './pages/GroupManagement';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <PublicOnlyRoute>
                                <Login />
                            </PublicOnlyRoute>
                        }
                    />

                    {/* Rotas protegidas (exigem login e token ativo) */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/cadastro/visitantes" element={<VisitorRegistration />} />
                        <Route path="/visitantes" element={<VisitorList />} />
                        <Route path="/membros" element={<MemberList />} />
                        <Route path="/membros/:id" element={<MemberProfile />} />
                        <Route path="/membros/:id/editar" element={<MemberProfile />} />
                        <Route path="/cargos" element={<MinistryManagement />} />
                        <Route path="/gcs" element={<GroupManagement />} />
                        <Route path="/perfil" element={<UserProfile />} />
                    </Route>

                    {/* Redirecionamento fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;