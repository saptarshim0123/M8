import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientDetail, getPatientSummary } from '../api/therapistAPI';
import {
    ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { LuArrowLeft, LuMessageCircle, LuBrainCircuit, LuShieldAlert, LuSparkles } from 'react-icons/lu';
import toast from 'react-hot-toast';
import Avatar from 'boring-avatars';

const MOOD_COLORS = {
    Happy: '#4ade80', Sad: '#60a5fa', Anxious: '#facc15',
    Angry: '#f87171', Neutral: '#a3a3a3', Mixed: '#c084fc',
};

const PatientDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingSummary, setLoadingSummary] = useState(false);

    useEffect(() => {
        getPatientDetail(userId)
            .then(r => setData(r.data))
            .catch(() => toast.error('Failed to load patient data'))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleGenerateSummary = async () => {
        setLoadingSummary(true);
        try {
            const res = await getPatientSummary(userId);
            setSummary(res.data.summary);
        } catch {
            toast.error('Failed to generate summary');
        } finally {
            setLoadingSummary(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
    );

    if (!data) return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-neutral/50">Patient not found</p>
        </div>
    );

    const { patient, moodTrend, moodDistribution, topKeywords, totalAnalyses, chatRoomId, recentEntries } = data;

    // Build chart data
    const chartData = moodTrend.map(m => ({
        date: new Date(m.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        sentiment: m.sentimentScore,
        intensity: m.intensityScore,
    }));

    const pieData = moodDistribution.map(m => ({
        name: m.mood,
        value: m.count,
    }));

    return (
        <div className="min-h-screen bg-base-200">
            {/* Top nav */}
            <div className="navbar bg-base-100 border-b px-6 sticky top-0 z-10">
                <div className="flex-1 flex items-center gap-3">
                    <button onClick={() => navigate('/therapist')} className="btn btn-ghost btn-sm btn-square">
                        <LuArrowLeft size={18} />
                    </button>
                    <span className="font-data text-lg font-bold">Patient Detail</span>
                </div>
                {chatRoomId && (
                    <button className="btn btn-primary btn-sm gap-1"
                        onClick={() => navigate(`/therapist/chat/${chatRoomId}`)}>
                        <LuMessageCircle size={14} /> Chat
                    </button>
                )}
            </div>

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

                {/* Patient header */}
                <div className="card bg-base-100 border shadow-sm">
                    <div className="card-body flex-row items-center gap-4 flex-wrap">
                        {patient.avatar ? (
                            <img src={patient.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                            <div className="shrink-0 overflow-hidden rounded-full">
                                <Avatar size={64} name={patient.name} variant="beam"
                                    colors={['#c4a882', '#7a5c3a', '#f5ede0', '#3d2b1f', '#e8d8c4']} />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-heading font-black">{patient.name}</h1>
                            <p className="text-sm text-neutral/50">{patient.email}</p>
                            <div className="flex gap-2 mt-1">
                                <span className="badge badge-sm badge-outline">{totalAnalyses} analyses (30d)</span>
                                {patient.shareRawJournals 
                                    ? <span className="badge badge-sm badge-success">Sharing journals</span>
                                    : <span className="badge badge-sm badge-warning">Insights only</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Privacy Notice */}
                {!patient.shareRawJournals && (
                    <div className="alert alert-warning shadow-sm">
                        <LuShieldAlert size={20} />
                        <span className="text-sm">
                            This patient has not enabled raw journal sharing. You can only see AI-generated insights, not the actual journal text.
                        </span>
                    </div>
                )}

                {/* AI Summary */}
                <div className="card bg-base-100 border shadow-sm">
                    <div className="card-body">
                        <h2 className="font-bold font-data text-lg flex items-center gap-2">
                            <LuBrainCircuit className="text-primary" /> AI Clinical Summary
                        </h2>
                        {summary ? (
                            <div className="bg-primary/5 rounded-2xl p-4 mt-2 border border-primary/10">
                                <p className="text-sm leading-relaxed">{summary}</p>
                            </div>
                        ) : (
                            <div className="mt-2">
                                <p className="text-sm text-neutral/50 mb-3">
                                    Generate a Gemini-powered summary of this patient's recent emotional trends.
                                </p>
                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={loadingSummary}
                                    className="btn btn-primary btn-sm gap-2"
                                >
                                    {loadingSummary
                                        ? <span className="loading loading-spinner loading-xs" />
                                        : <LuSparkles size={14} />
                                    }
                                    Generate Summary
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sentiment & Intensity Timeline */}
                    <div className="card bg-base-100 border shadow-sm lg:col-span-2">
                        <div className="card-body">
                            <h2 className="font-bold font-data text-lg">Mood Trends (30 days)</h2>
                            <p className="text-xs text-neutral/40 mb-2">Sentiment and intensity over time</p>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <ComposedChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="left" domain={[-1, 1]} tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Area yAxisId="left" type="monotone" name="Sentiment" dataKey="sentiment" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorSent)" />
                                        <Line yAxisId="right" type="monotone" name="Intensity" dataKey="intensity" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-neutral/40 py-8">No data available</p>
                            )}
                        </div>
                    </div>

                    {/* Mood Distribution Pie */}
                    <div className="card bg-base-100 border shadow-sm">
                        <div className="card-body">
                            <h2 className="font-bold font-data text-lg">Mood Distribution</h2>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                            innerRadius={50} outerRadius={80} paddingAngle={3} stroke="none">
                                            {pieData.map(entry => (
                                                <Cell key={entry.name} fill={MOOD_COLORS[entry.name] || '#a3a3a3'} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-neutral/40 py-8">No mood data</p>
                            )}
                        </div>
                    </div>

                    {/* Top Keywords */}
                    <div className="card bg-base-100 border shadow-sm">
                        <div className="card-body">
                            <h2 className="font-bold font-data text-lg">Top Themes</h2>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {topKeywords.length > 0 ? topKeywords.map(kw => (
                                    <span key={kw.name} className="badge badge-outline badge-lg gap-1 capitalize">
                                        {kw.name}
                                        <span className="text-primary font-bold">{kw.count}</span>
                                    </span>
                                )) : (
                                    <p className="text-neutral/40 text-sm">No themes detected yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Raw Journals */}
                {recentEntries && recentEntries.length > 0 && (
                    <div className="card bg-base-100 border shadow-sm">
                        <div className="card-body">
                            <h2 className="font-bold font-data text-lg">Recent Journal Entries</h2>
                            <p className="text-xs text-neutral/40 mb-3">Patient has opted to share their raw journal entries</p>
                            <div className="space-y-3">
                                {recentEntries.map(entry => (
                                    <div key={entry._id} className="bg-base-200 rounded-xl p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-sm">{entry.title || 'Untitled'}</h3>
                                            <span className="text-xs text-neutral/40">
                                                {new Date(entry.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-sm text-neutral/70 line-clamp-4" dangerouslySetInnerHTML={{ __html: entry.text }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDetail;
