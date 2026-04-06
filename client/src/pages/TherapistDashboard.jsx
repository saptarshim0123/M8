import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPatients, getConnectionRequests, acceptRequest, rejectRequest } from '../api/therapistAPI';
import { LuUsers, LuBell, LuMessageCircle, LuLogOut, LuLayoutDashboard, LuCheck, LuX, LuClipboardCheck, LuCopy } from 'react-icons/lu';
import toast from 'react-hot-toast';
import Avatar from 'boring-avatars';

const MOOD_BADGES = {
    Happy: 'badge-success',
    Sad: 'badge-info',
    Anxious: 'badge-warning',
    Angry: 'badge-error',
    Neutral: 'badge-ghost',
    Mixed: 'badge-secondary',
    'N/A': 'badge-ghost',
};

const TherapistDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        getPatients()
            .then(r => setPatients(r.data))
            .catch(() => toast.error('Failed to load patients'))
            .finally(() => setLoadingPatients(false));

        getConnectionRequests()
            .then(r => setRequests(r.data))
            .catch(() => toast.error('Failed to load requests'))
            .finally(() => setLoadingRequests(false));
    }, []);

    const handleAccept = async (id) => {
        try {
            await acceptRequest(id);
            setRequests(prev => prev.filter(r => r._id !== id));
            toast.success('Connection accepted!');
            // Refresh patients
            const res = await getPatients();
            setPatients(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept');
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectRequest(id);
            setRequests(prev => prev.filter(r => r._id !== id));
            toast.success('Connection rejected');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject');
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(user?.practiceCode || '');
        setCopied(true);
        toast.success('Practice code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-base-200">
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

                {/* Page title */}
                <h1 className="font-heading text-2xl font-bold">Therapist Dashboard</h1>

                {/* Practice Code Card */}
                <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 shadow-sm">
                    <div className="card-body flex-row items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="font-bold text-lg font-data">Your Practice Code</h2>
                            <p className="text-xs text-neutral/50">Share this code with your clients so they can connect with you</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-3xl font-black tracking-[0.3em] text-primary">
                                {user?.practiceCode || '------'}
                            </span>
                            <button onClick={handleCopyCode} className="btn btn-ghost btn-sm btn-square">
                                {copied ? <LuCheck size={18} className="text-success" /> : <LuCopy size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="card bg-base-100 border shadow-sm">
                        <div className="card-body flex-row items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary text-2xl"><LuUsers /></div>
                            <div>
                                <p className="text-sm text-neutral/50">Active Patients</p>
                                <p className="text-2xl font-bold font-data">{patients.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card bg-base-100 border shadow-sm">
                        <div className="card-body flex-row items-center gap-4">
                            <div className="p-3 rounded-xl bg-warning/10 text-warning text-2xl"><LuBell /></div>
                            <div>
                                <p className="text-sm text-neutral/50">Pending Requests</p>
                                <p className="text-2xl font-bold font-data">{requests.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card bg-base-100 border shadow-sm">
                        <div className="card-body flex-row items-center gap-4">
                            <div className="p-3 rounded-xl bg-success/10 text-success text-2xl"><LuClipboardCheck /></div>
                            <div>
                                <p className="text-sm text-neutral/50">Status</p>
                                <p className="text-lg font-bold font-data text-success">Verified ✓</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Connection Requests */}
                {requests.length > 0 && (
                    <div className="card bg-base-100 border shadow-sm border-warning/30">
                        <div className="card-body">
                            <h2 className="font-bold font-data text-lg flex items-center gap-2">
                                <LuBell className="text-warning" /> New Connection Requests
                                <span className="badge badge-warning badge-sm">{requests.length}</span>
                            </h2>
                            <div className="space-y-3 mt-2">
                                {loadingRequests ? (
                                    [1, 2].map(i => <div key={i} className="skeleton h-16 w-full" />)
                                ) : (
                                    requests.map(req => (
                                        <div key={req._id} className="flex items-center justify-between bg-base-200 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                {req.userId?.avatar ? (
                                                    <img src={req.userId.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="shrink-0 overflow-hidden rounded-full">
                                                        <Avatar size={40} name={req.userId?.name} variant="beam"
                                                            colors={['#c4a882', '#7a5c3a', '#f5ede0', '#3d2b1f', '#e8d8c4']} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{req.userId?.name}</p>
                                                    <p className="text-xs text-neutral/50">{req.userId?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAccept(req._id)} className="btn btn-success btn-sm gap-1">
                                                    <LuCheck size={14} /> Accept
                                                </button>
                                                <button onClick={() => handleReject(req._id)} className="btn btn-ghost btn-sm text-error gap-1">
                                                    <LuX size={14} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Patient List */}
                <div className="card bg-base-100 border shadow-sm">
                    <div className="card-body">
                        <h2 className="font-bold font-data text-lg flex items-center gap-2">
                            <LuUsers /> Patient List ({patients.length})
                        </h2>

                        {loadingPatients ? (
                            <div className="space-y-2 mt-2">
                                {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
                            </div>
                        ) : patients.length === 0 ? (
                            <div className="text-center py-8 text-neutral/50">
                                <LuUsers size={48} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No patients connected yet.</p>
                                <p className="text-xs mt-1">Share your Practice Code with clients to get started.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto mt-2">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Current Vibe</th>
                                            <th>Last Journal</th>
                                            <th>Sharing</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.map(p => (
                                            <tr key={p.connectionId} className="hover:bg-base-200/50 cursor-pointer"
                                                onClick={() => navigate(`/therapist/patient/${p.user._id}`)}>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        {p.user.avatar ? (
                                                            <img src={p.user.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="shrink-0 overflow-hidden rounded-full">
                                                                <Avatar size={32} name={p.user.name} variant="beam"
                                                                    colors={['#c4a882', '#7a5c3a', '#f5ede0', '#3d2b1f', '#e8d8c4']} />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="font-medium">{p.user.name}</span>
                                                            <p className="text-xs text-neutral/50">{p.user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-sm ${MOOD_BADGES[p.latestMood]}`}>
                                                        {p.latestMood}
                                                    </span>
                                                </td>
                                                <td className="text-neutral/60 text-sm">
                                                    {p.user.lastEntryDate
                                                        ? new Date(p.user.lastEntryDate).toLocaleDateString()
                                                        : '—'}
                                                </td>
                                                <td>
                                                    {p.user.shareRawJournals
                                                        ? <span className="badge badge-success badge-xs">Journals</span>
                                                        : <span className="badge badge-ghost badge-xs">Insights only</span>
                                                    }
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-ghost btn-xs gap-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/therapist/chat/${p.chatRoomId}`);
                                                        }}
                                                    >
                                                        <LuMessageCircle size={14} /> Chat
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TherapistDashboard;
