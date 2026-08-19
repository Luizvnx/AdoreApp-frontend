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

                    {/* Rotas protegidas gerais */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/perfil" element={<UserProfile />} />
                    </Route>

                    {/* Módulo de Visitantes */}
                    <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_WELCOME']} />}>
                        <Route path="/cadastro/visitantes" element={<VisitorRegistration />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_WELCOME', 'GC_SUPERVISOR', 'GC_LEADER']} />}>
                        <Route path="/visitantes" element={<VisitorList />} />
                        <Route path="/membros" element={<MemberList />} />
                        <Route path="/membros/:id" element={<MemberProfile />} />
                        <Route path="/membros/:id/editar" element={<MemberProfile />} />
                    </Route>

                    {/* Módulo de Cargos & Ministérios */}
                    <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'WORSHIP_LEADER']} />}>
                        <Route path="/cargos" element={<MinistryManagement />} />
                    </Route>

                    {/* Módulo de Grupos de Conexão (GCs) */}
                    <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'GC_SUPERVISOR', 'GC_LEADER']} />}>
                        <Route path="/gcs" element={<GroupManagement />} />
                    </Route>

                    {/* Redirecionamento fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;