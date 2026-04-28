import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import MainLayout from '../components/layout/MainLayout';

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
                    {/* <Route path="/warga" element={<Warga />} /> */}
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;