import { useEffect, useState } from 'react';
import {
    getAdminStats,
    getUserGrowth,
    getUserDeletions,
    getAggregatedInsights,
    getAdminUsers,
    adminDeleteUser,
    getPendingTherapists,
    verifyTherapist,
    rejectTherapist,
} from '../api/adminAPI';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LuUsers, LuBookOpen, LuBrainCircuit, LuLogOut, LuLayoutDashboard, LuTrash2, LuStethoscope, LuCheck, LuX, LuExternalLink, LuSearch, LuFilter } from 'react-icons/lu';
import toast from 'react-hot-toast';

const MOOD_COLORS = {
    Happy: '#4ade80',
    Sad: '#60a5fa',
    Anxious: '#facc15',
    Angry: '#f87171',
    Neutral: '#a3a3a3',
    Mixed: '#c084fc',
};

const RANGE_OPTIONS = [
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 },
];

const StatCard = ({ icon, label, value, loading }) => (
    <div className="card bg-base-100 border shadow-sm">
        <div className="card-body flex-row items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary text-2xl">{icon}</div>
            <div>
                <p className="text-sm text-neutral/50">{label}</p>
                {loading
                    ? <div className="skeleton h-7 w-16 mt-1" />
                    : <p className="text-2xl font-bold font-data">{value?.toLocaleString()}</p>
                }
            </div>
        </div>
    </div>
);

const SectionSkeleton = () => (
    <div className="card bg-base-100 border shadow-sm">
        <div className="card-body gap-3">
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-48 w-full" />
        </div>
    </div>
);


const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [range, setRange] = useState(30);
    const [stats, setStats] = useState(null);
    const [growth, setGrowth] = useState([]);
    const [deletions, setDeletions] = useState([]);
    const [insights, setInsights] = useState(null);
    const [users, setUsers] = useState([]);

    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingCharts, setLoadingCharts] = useState(true);
    const [loadingInsights, setLoadingInsights] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [userToDelete, setUserToDelete] = useState(null);
    const [pendingTherapists, setPendingTherapists] = useState([]);
    const [loadingTherapists, setLoadingTherapists] = useState(true);
    const [searchEmail, setSearchEmail] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        getAdminStats()
            .then(r => setStats(r.data))
            .finally(() => setLoadingStats(false));

        getAggregatedInsights()
            .then(r => setInsights(r.data))
            .finally(() => setLoadingInsights(false));

        getAdminUsers()
            .then(r => setUsers(r.data))
            .finally(() => setLoadingUsers(false));

        getPendingTherapists()
            .then(r => setPendingTherapists(r.data))
            .finally(() => setLoadingTherapists(false));
    }, []);

    useEffect(() => {
        setLoadingCharts(true);
        Promise.all([getUserGrowth(range), getUserDeletions(range)])
            .then(([g, d]) => {
                setGrowth(g.data);
                setDeletions(d.data);
            })
            .finally(() => setLoadingCharts(false));
    }, [range]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        const original = [...users];
        setUsers(users.filter(u => u._id !== userToDelete._id));
        setUserToDelete(null);
        document.getElementById('admin_delete_modal').close();
        try {
            await adminDeleteUser(userToDelete._id);
            setStats(s => s ? { ...s, totalUsers: s.totalUsers - 1 } : s);
            toast.success(`${userToDelete.name} deleted`);
        } catch (err) {
            toast.error('Failed to delete user');
            setUsers(original);
        }
    };

    // Merge growth + deletions by date for combined chart
    const combinedChart = growth.map(g => ({
        date: g.date.slice(5), // MM-DD
        'New Users': g.count,
        'Deletions': deletions.find(d => d.date === g.date)?.count || 0,
    }));

    return (
        <div className="min-h-screen bg-base-200">
            {/* Top bar */}
            <div className="navbar bg-base-100 border-b px-6 sticky top-0 z-10">
                <div className="flex-1">
                    <span className="font-heading text-xl font-bold">Admin Panel</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral/50 hidden sm:block">{user?.email}</span>
                    <button className="btn btn-ghost btn-sm gap-1" onClick={() => navigate('/dashboard')}>
                        <LuLayoutDashboard size={16} /> My Dashboard
                    </button>
                    <button className="btn btn-ghost btn-sm gap-1" onClick={handleLogout}>
                        <LuLogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard icon={<LuUsers />} label="Total Users" value={stats?.totalUsers} loading={loadingStats} />
                    <StatCard icon={<LuBookOpen />} label="Total Entries" value={stats?.totalEntries} loading={loadingStats} />
                    <StatCard icon={<LuBrainCircuit />} label="Total Analyses" value={stats?.totalAnalyses} loading={loadingStats} />
                    <StatCard icon={<LuStethoscope />} label="Total Therapists" value={stats?.totalTherapists} loading={loadingStats} />
                    <StatCard icon={<LuStethoscope />} label="Pending Therapists" value={stats?.pendingTherapists} loading={loadingStats} />
                </div>

                {/* Pending Therapist Verifications */}
                {pendingTherapists.length > 0 && (
                    <div className="card bg-base-100 border shadow-sm border-warning/30">
                        <div className="card-body">
                            <h2 className="font-bold font-data text-lg flex items-center gap-2">
                                <LuStethoscope className="text-warning" /> Pending Therapist Verifications
                                <span className="badge badge-warning badge-sm">{pendingTherapists.length}</span>
                            </h2>
                            <div className="overflow-x-auto mt-2">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>License #</th>
                                            <th>Specialization</th>
                                            <th>Document</th>
                                            <th>Applied</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingTherapists.map(t => (
                                            <tr key={t._id}>
                                                <td className="font-medium">{t.name}</td>
                                                <td className="text-neutral/60">{t.email}</td>
                                                <td><code className="text-xs bg-base-200 px-2 py-1 rounded">{t.licenseNumber}</code></td>
                                                <td className="text-neutral/60">{t.specialization || '—'}</td>
                                                <td>
                                                    {t.documentUrl ? (
                                                        <a href={t.documentUrl} target="_blank" rel="noreferrer"
                                                            className="btn btn-ghost btn-xs gap-1">
                                                            <LuExternalLink size={12} /> View
                                                        </a>
                                                    ) : '—'}
                                                </td>
                                                <td className="text-neutral/60 text-xs">
                                                    {new Date(t.createdAt).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button
                                                            className="btn btn-success btn-xs gap-1"
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await verifyTherapist(t._id);
                                                                    setPendingTherapists(prev => prev.filter(x => x._id !== t._id));
                                                                    setStats(s => s ? { ...s, pendingTherapists: s.pendingTherapists - 1 } : s);
                                                                    toast.success(`Verified! Code: ${res.data.practiceCode}`);
                                                                } catch {
                                                                    toast.error('Failed to verify');
                                                                }
                                                            }}
                                                        >
                                                            <LuCheck size={12} /> Verify
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-xs text-error gap-1"
                                                            onClick={async () => {
                                                                try {
                                                                    await rejectTherapist(t._id);
                                                                    setPendingTherapists(prev => prev.filter(x => x._id !== t._id));
                                                                    setStats(s => s ? { ...s, pendingTherapists: s.pendingTherapists - 1 } : s);
                                                                    toast.success('Therapist rejected');
                                                                } catch {
                                                                    toast.error('Failed to reject');
                                                                }
                                                            }}
                                                        >
                                                            <LuX size={12} /> Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Range selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral/50">Show:</span>
                    {RANGE_OPTIONS.map(o => (
                        <button
                            key={o.value}
                            onClick={() => setRange(o.value)}
                            className={`btn btn-sm rounded-full ${range === o.value ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>

                {/* User growth + deletions combined chart */}
                {loadingCharts ? <SectionSkeleton /> : (
                    <div className="card bg-base-100 border shadow-sm">
                        <div className="card-body">
                            <h2 className="font-bold font-data text-lg">User Activity</h2>
                            <p className="text-xs text-neutral/40 mb-2">New signups vs deletions over the last {range} days</p>
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={combinedChart}>
                                    <defs>
                                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorDel" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="New Users" stroke="#6366f1" fill="url(#colorNew)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="Deletions" stroke="#f87171" fill="url(#colorDel)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Insights row */}
                {loadingInsights ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SectionSkeleton /><SectionSkeleton />
                    </div>
                ) : insights && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mood distribution pie */}
                        <div className="card bg-base-100 border shadow-sm">
                            <div className="card-body">
                                <h2 className="font-bold font-data text-lg">Mood Distribution</h2>
                                <p className="text-xs text-neutral/40 mb-2">Across all user analyses</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={insights.moodDistribution}
                                            dataKey="count"
                                            nameKey="mood"
                                            cx="50%" cy="50%"
                                            outerRadius={80}
                                            label={({ mood, percent }) => `${mood} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {insights.moodDistribution.map((entry) => (
                                                <Cell key={entry.mood} fill={MOOD_COLORS[entry.mood] || '#a3a3a3'} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top distortions bar */}
                        <div className="card bg-base-100 border shadow-sm">
                            <div className="card-body">
                                <h2 className="font-bold font-data text-lg">Top Cognitive Distortions</h2>
                                <p className="text-xs text-neutral/40 mb-2">Most common patterns across users</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={insights.topDistortions} layout="vertical">
                                        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Avg scores */}
                        <div className="card bg-base-100 border shadow-sm">
                            <div className="card-body gap-4">
                                <h2 className="font-bold font-data text-lg">Platform Averages</h2>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-3xl font-bold font-data text-primary">
                                            {insights.averages.avgSentiment?.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-neutral/50 mt-1">Avg Sentiment<br/>(-1 to 1)</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold font-data text-secondary">
                                            {insights.averages.avgIntensity?.toFixed(1)}
                                        </p>
                                        <p className="text-xs text-neutral/50 mt-1">Avg Intensity<br/>(1–10)</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold font-data text-accent">
                                            {insights.averages.totalAnalyses}
                                        </p>
                                        <p className="text-xs text-neutral/50 mt-1">Total<br/>Analyses</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top keywords */}
                        <div className="card bg-base-100 border shadow-sm">
                            <div className="card-body">
                                <h2 className="font-bold font-data text-lg">Top Keywords</h2>
                                <p className="text-xs text-neutral/40 mb-3">Most frequent themes across all entries</p>
                                <div className="flex flex-wrap gap-2">
                                    {insights.topKeywords.map(k => (
                                        <span key={k.name} className="badge badge-ghost gap-1">
                                            {k.name}
                                            <span className="text-primary font-bold">{k.count}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users table */}
                <div className="card bg-base-100 border shadow-sm">
                    <div className="card-body">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="font-bold font-data text-lg">Users ({users.length})</h2>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                {/* Search by email */}
                                <div className="relative">
                                    <LuSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral/40" />
                                    <input
                                        type="text"
                                        placeholder="Search by email…"
                                        value={searchEmail}
                                        onChange={e => setSearchEmail(e.target.value)}
                                        className="input input-bordered input-sm pl-9 w-full sm:w-56"
                                    />
                                </div>
                                {/* Role filter */}
                                <div className="relative">
                                    <LuFilter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral/40" />
                                    <select
                                        value={roleFilter}
                                        onChange={e => setRoleFilter(e.target.value)}
                                        className="select select-bordered select-sm pl-9 w-full sm:w-40"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="user">Users</option>
                                        <option value="therapist">Therapists</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        {loadingUsers ? (
                            <div className="space-y-2 mt-2">
                                {[1,2,3].map(i => <div key={i} className="skeleton h-10 w-full" />)}
                            </div>
                        ) : (() => {
                            const filtered = users.filter(u => {
                                const matchEmail = !searchEmail || u.email.toLowerCase().includes(searchEmail.toLowerCase());
                                const matchRole = roleFilter === 'all' || u.role === roleFilter;
                                return matchEmail && matchRole;
                            });
                            return (
                                <>
                                    {filtered.length === 0 ? (
                                        <p className="text-center text-neutral/40 py-8 text-sm">No users match your filters.</p>
                                    ) : (
                                        <div className="overflow-x-auto mt-2">
                                            <p className="text-xs text-neutral/40 mb-2">Showing {filtered.length} of {users.length} users</p>
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>User</th>
                                                        <th>Email</th>
                                                        <th>Role</th>
                                                        <th>Joined</th>
                                                        <th>Streak</th>
                                                        <th>Last Entry</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filtered.map(u => (
                                                        <tr key={u._id}>
                                                            <td>
                                                                <div className="flex items-center gap-2">
                                                                    {u.avatar
                                                                        ? <img src={u.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                                                                        : <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">{u.name?.[0]}</div>
                                                                    }
                                                                    <span className="font-medium">{u.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="text-neutral/60">{u.email}</td>
                                                            <td>
                                                                <span className={`badge badge-sm ${
                                                                    u.role === 'therapist' ? 'badge-primary' : 'badge-ghost'
                                                                }`}>
                                                                    {u.role === 'therapist' ? 'Therapist' : 'User'}
                                                                </span>
                                                            </td>
                                                            <td className="text-neutral/60">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                            <td>{u.streak}</td>
                                                            <td className="text-neutral/60">
                                                                {u.lastEntryDate ? new Date(u.lastEntryDate).toLocaleDateString() : '—'}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-ghost btn-xs text-error"
                                                                    onClick={() => {
                                                                        setUserToDelete(u);
                                                                        document.getElementById('admin_delete_modal').showModal();
                                                                    }}
                                                                >
                                                                    <LuTrash2 size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>

            </div>

            {/* Delete user confirmation modal */}
            <dialog id="admin_delete_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold font-data text-lg">Delete user?</h3>
                    <p className="py-3 text-sm opacity-80">
                        This will permanently delete <span className="font-semibold">{userToDelete?.name}</span> and all their entries and analyses. This cannot be undone.
                    </p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn" onClick={() => setUserToDelete(null)}>Cancel</button>
                        </form>
                        <button className="btn btn-error" onClick={handleDeleteUser}>Delete</button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setUserToDelete(null)}>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default AdminDashboard;
