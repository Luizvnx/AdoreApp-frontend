import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VisitorRegistration from './pages/VisitorRegistration';
import VisitorList from './pages/VisitorList';
import MemberList from './pages/MemberList';
import MemberProfile from './pages/MemberProfile';
import UserProfile from './pages/UserProfile';
import MinistryManagement from './pages/MinistryManagement';
import GroupManagement from './pages/GroupManagement';
import ServiceMetrics from './pages/ServiceMetrics';
import FinanceDashboard from './pages/FinanceDashboard';
import WhatsAppAutomation from './pages/WhatsAppAutomation';

// Hubs
import VisitorsHub from './pages/hubs/VisitorsHub';
import MembersHub from './pages/hubs/MembersHub';
import ChurchHub from './pages/hubs/ChurchHub';
import PastorDashboard from './pages/PastorDashboard';

import { CongregationProvider } from './context/CongregationContext';
import CongregationManagement from './pages/CongregationManagement';

const App: React.FC = () => {
    return (
        <ToastProvider>
            <AuthProvider>
                <CongregationProvider>
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

                            {/* Rotas abraçadas pelo AppLayout */}
                            <Route element={<AppLayout />}>
                                {/* Rotas protegidas gerais */}
                                <Route element={<ProtectedRoute />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/perfil" element={<UserProfile />} />
                                </Route>

                                {/* Pastor Dashboard & Gestão de Congregações */}
                                <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                                    <Route path="/gestao" element={<PastorDashboard />} />
                                    <Route path="/congregacoes" element={<CongregationManagement />} />
                                </Route>

                            {/* Hubs Intermediários */}
                            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_WELCOME', 'GC_SUPERVISOR', 'GC_LEADER']} />}>
                                <Route path="/hub/visitantes" element={<VisitorsHub />} />
                                <Route path="/hub/membros" element={<MembersHub />} />
                            </Route>
                            
                            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_WELCOME', 'GC_SUPERVISOR', 'GC_LEADER', 'WORSHIP_LEADER']} />}>
                                <Route path="/hub/igreja" element={<ChurchHub />} />
                            </Route>

                            {/* Módulo de Frequência & Métricas dos Cultos */}
                            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_WELCOME', 'GC_SUPERVISOR', 'GC_LEADER', 'WORSHIP_LEADER']} />}>
                                <Route path="/metricas" element={<ServiceMetrics />} />
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

                            {/* Módulo Financeiro / Tesouraria */}
                            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FINANCE_ADMIN']} />}>
                                <Route path="/financeiro" element={<FinanceDashboard />} />
                            </Route>

                            {/* Módulo WhatsApp & Automações */}
                            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PASTOR', 'DIRECTOR', 'ADMIN_WELCOME', 'GC_SUPERVISOR']} />}>
                                <Route path="/whatsapp" element={<WhatsAppAutomation />} />
                            </Route>
                        </Route>

                        {/* Redirecionamento fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </CongregationProvider>
        </AuthProvider>
    </ToastProvider>
    );
};

export default App;