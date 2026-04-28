import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';

// Pages Section
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import MasterPenghuni from '../pages/Master/Penghuni';
import MasterRumah from '../pages/Master/Rumah';

const PrivateRoute = () => {
    const token = localStorage.getItem('access_token');
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="master" element={<Outlet />}>
                        <Route path="penghuni" element={<MasterPenghuni />} />
                        <Route path="rumah" element={<MasterRumah />} />
                    </Route>
                    <Route path="/penghuni" element={<MasterPenghuni />} />
                    <Route path="/rumah" element={<MasterRumah />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;