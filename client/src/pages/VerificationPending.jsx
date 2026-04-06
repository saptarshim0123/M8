import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/authAPI';
import { LuClock, LuLogOut, LuShieldCheck, LuRefreshCw } from 'react-icons/lu';

const VerificationPending = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);

    const checkStatus = async () => {
        setChecking(true);
        try {
            const res = await getMe();
            if (res.data.isVerified) {
                updateUser({
                    isVerified: true,
                    practiceCode: res.data.practiceCode,
                    specialization: res.data.specialization,
                });
                navigate('/therapist');
            }
        } catch {
            // ignore
        } finally {
            setChecking(false);
        }
    };

    // Auto-check on mount
    useEffect(() => {
        if (user?.role === 'therapist') {
            checkStatus();
        }
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
            <div className="card bg-base-100 shadow-xl max-w-md w-full">
                <div className="card-body items-center text-center gap-6">
                    {/* Animated icon */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-warning/10 flex items-center justify-center animate-pulse">
                            <LuClock className="text-warning" size={48} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <LuShieldCheck className="text-primary" size={18} />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl font-heading font-black tracking-tight mb-2">
                            Verification In Progress
                        </h1>
                        <p className="text-base-content/60 text-sm leading-relaxed">
                            Welcome, <span className="font-semibold text-base-content">{user?.name}</span>! 
                            Your therapist account is currently under review by our admin team.
                        </p>
                    </div>

                    <div className="bg-base-200 rounded-2xl p-4 w-full">
                        <h3 className="font-semibold text-sm mb-2">What happens next?</h3>
                        <ul className="text-xs text-base-content/60 space-y-2 text-left">
                            <li className="flex items-start gap-2">
                                <span className="badge badge-xs badge-primary mt-1">1</span>
                                Our admin reviews your uploaded credentials
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="badge badge-xs badge-primary mt-1">2</span>
                                Once verified, you'll receive a unique Practice Code
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="badge badge-xs badge-primary mt-1">3</span>
                                Share the code with your clients to connect
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={checkStatus}
                        disabled={checking}
                        className="btn btn-primary btn-sm gap-2 w-full"
                    >
                        {checking
                            ? <span className="loading loading-spinner loading-xs" />
                            : <LuRefreshCw size={14} />
                        }
                        Check Verification Status
                    </button>

                    <div className="divider my-0"></div>

                    <button onClick={handleLogout} className="btn btn-ghost btn-sm gap-2 text-error">
                        <LuLogOut size={16} /> Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationPending;
