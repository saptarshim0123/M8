import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { getMe } from '../api/authAPI';

const TherapistRoute = () => {
    const { user, updateUser } = useAuth();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Re-fetch profile from server to get latest isVerified status
        if (user?.role === 'therapist') {
            getMe()
                .then(res => {
                    updateUser(res.data);
                })
                .catch(() => {})
                .finally(() => setChecking(false));
        } else {
            setChecking(false);
        }
    }, []);

    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'therapist') return <Navigate to="/dashboard" replace />;
    if (checking) return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
    );
    if (!user.isVerified) return <Navigate to="/verification-pending" replace />;
    return <Outlet />;
};

export default TherapistRoute;

