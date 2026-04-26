import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { getMe } from '../api/authAPI';

const ProtectedRoute = () => {
    const { user, updateUser } = useAuth();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (user) {
            getMe()
                .then(res => {
                    updateUser(res.data);
                })
                .catch(() => {})
                .finally(() => setReady(true));
        } else {
            setReady(true);
        }
    }, []);

    if (!user) return <Navigate to="/login" replace />;
    if (!ready) return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
    );

    // Redirect therapists to their own dashboard
    if (user.role === 'therapist') {
        if (!user.isVerified) return <Navigate to="/verification-pending" replace />;
        return <Navigate to="/therapist" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;