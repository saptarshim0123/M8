import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTherapist, connectWithCode, disconnectTherapist, toggleShareJournals } from '../api/connectionAPI';
import { useAuth } from '../hooks/useAuth';
import { LuStethoscope, LuMessageCircle, LuLink2Off, LuClock, LuShieldCheck, LuEye, LuEyeOff } from 'react-icons/lu';
import toast from 'react-hot-toast';
import Avatar from 'boring-avatars';

const ProfessionalSupport = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [connection, setConnection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toggling, setToggling] = useState(false);

    const fetchConnection = () => {
        setLoading(true);
        getMyTherapist()
            .then(r => setConnection(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchConnection();
    }, []);

    const handleConnect = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setSubmitting(true);
        try {
            const res = await connectWithCode(code.trim().toUpperCase());
            toast.success(res.data.message || 'Connection request sent!');
            setCode('');
            fetchConnection();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to connect');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!connection?._id) return;
        try {
            await disconnectTherapist(connection._id);
            toast.success('Disconnected from therapist');
            setConnection(null);
        } catch (err) {
            toast.error('Failed to disconnect');
        }
    };

    const handleToggleShare = async () => {
        setToggling(true);
        try {
            const res = await toggleShareJournals();
            updateUser({ shareRawJournals: res.data.shareRawJournals });
            toast.success(res.data.shareRawJournals ? 'Journal sharing enabled' : 'Journal sharing disabled');
        } catch {
            toast.error('Failed to update setting');
        } finally {
            setToggling(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
    );

    // Not connected — show code input
    if (!connection) {
        return (
            <div className="p-6 max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-heading font-black tracking-tight mb-2">Professional Support</h1>
                    <p className="text-base-content/60">Connect with a licensed therapist for professional guidance alongside your journaling.</p>
                </div>

                <div className="card bg-base-100 border shadow-sm">
                    <div className="card-body items-center text-center gap-5">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <LuStethoscope className="text-primary" size={36} />
                        </div>

                        <div>
                            <h2 className="text-xl font-heading font-bold mb-1">Connect with a Therapist</h2>
                            <p className="text-sm text-base-content/60 max-w-sm">
                                Enter the 6-character Practice Code your therapist has provided to establish a secure connection.
                            </p>
                        </div>

                        <form onSubmit={handleConnect} className="w-full max-w-xs space-y-3">
                            <input
                                type="text"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                placeholder="E.g. A1B2C3"
                                maxLength={6}
                                className="input input-bordered w-full text-center tracking-[0.3em] text-xl font-mono font-bold"
                            />
                            <button
                                type="submit"
                                disabled={submitting || code.length !== 6}
                                className="btn btn-primary w-full"
                            >
                                {submitting
                                    ? <span className="loading loading-spinner loading-sm" />
                                    : 'Connect'
                                }
                            </button>
                        </form>

                        <div className="bg-base-200 rounded-2xl p-4 w-full mt-2">
                            <h3 className="font-semibold text-sm mb-2">How it works</h3>
                            <ul className="text-xs text-base-content/60 space-y-1.5 text-left">
                                <li className="flex items-start gap-2">
                                    <span className="badge badge-xs badge-primary mt-0.5">1</span>
                                    Your therapist gives you their unique Practice Code
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="badge badge-xs badge-primary mt-0.5">2</span>
                                    Enter the code above to send a connection request
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="badge badge-xs badge-primary mt-0.5">3</span>
                                    Once they accept, you can chat and share insights securely
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const therapist = connection.therapist;

    // Pending connection
    if (connection.status === 'pending') {
        return (
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-heading font-black tracking-tight">Professional Support</h1>

                <div className="card bg-base-100 border shadow-sm">
                    <div className="card-body items-center text-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center animate-pulse">
                            <LuClock className="text-warning" size={36} />
                        </div>
                        <h2 className="text-xl font-heading font-bold">Waiting for Approval</h2>
                        <p className="text-sm text-base-content/60">
                            Your connection request to <strong>{therapist?.name}</strong> is pending.
                            They'll review and accept it soon.
                        </p>
                        <button onClick={handleDisconnect} className="btn btn-ghost btn-sm text-error gap-1 mt-2">
                            <LuLink2Off size={14} /> Cancel Request
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Active connection
    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-heading font-black tracking-tight">Professional Support</h1>

            {/* Therapist Card */}
            <div className="card bg-base-100 border shadow-sm">
                <div className="card-body gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {therapist?.avatar ? (
                                <img src={therapist.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className="shrink-0 overflow-hidden rounded-full">
                                    <Avatar size={64} name={therapist?.name} variant="beam"
                                        colors={['#c4a882', '#7a5c3a', '#f5ede0', '#3d2b1f', '#e8d8c4']} />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center">
                                <LuShieldCheck className="text-success-content" size={12} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold">{therapist?.name}</h2>
                            <p className="text-sm text-base-content/50">{therapist?.specialization || 'Licensed Therapist'}</p>
                            <span className="badge badge-success badge-sm mt-1">Connected</span>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => navigate(`/therapist-chat/${connection.chatRoomId}`)}
                            className="btn btn-primary btn-sm flex-1 gap-1"
                        >
                            <LuMessageCircle size={14} /> Open Chat
                        </button>
                        <button onClick={handleDisconnect} className="btn btn-ghost btn-sm text-error gap-1">
                            <LuLink2Off size={14} /> Disconnect
                        </button>
                    </div>
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="card bg-base-100 border shadow-sm">
                <div className="card-body">
                    <h2 className="font-bold font-data text-lg">Privacy Settings</h2>
                    <p className="text-xs text-base-content/50 mb-3">
                        Control what your therapist can see about your journaling activity.
                    </p>

                    <div className="flex items-center justify-between bg-base-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            {user?.shareRawJournals
                                ? <LuEye size={20} className="text-success" />
                                : <LuEyeOff size={20} className="text-neutral/40" />
                            }
                            <div>
                                <p className="font-medium text-sm">Share Raw Journals</p>
                                <p className="text-xs text-base-content/50">
                                    {user?.shareRawJournals
                                        ? 'Your therapist can see your journal entries'
                                        : 'Your therapist can only see AI-generated insights'
                                    }
                                </p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={user?.shareRawJournals || false}
                            onChange={handleToggleShare}
                            disabled={toggling}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalSupport;
