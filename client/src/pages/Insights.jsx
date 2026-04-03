import { useEffect, useState, useMemo } from 'react';
import { getAllAnalyses } from '../api/analyzeAPI';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF66A5'];

const Insights = () => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await getAllAnalyses();
                setInsights(res.data);
            } catch (error) {
                console.error("Error fetching insights:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    // Aggregating Data for Charts using useMemo
    const { 
        averageSentiment, 
        mostFrequentMood, 
        trendData, 
        moodDistribution, 
        topDistortions 
    } = useMemo(() => {
        if (!insights || insights.length === 0) {
            return {
                averageSentiment: 0,
                mostFrequentMood: 'N/A',
                trendData: [],
                moodDistribution: [],
                topDistortions: []
            };
        }

        // Sort chronologically
        const sorted = [...insights].sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));

        let totalSentiment = 0;
        let validSentimentCount = 0;
        const moodCounts = {};
        const distortionCounts = {};

        const timelineData = sorted.map((entry) => {
            // Sentiment
            const sentiment = Number(entry.sentimentScore);
            if (!isNaN(sentiment)) {
                totalSentiment += sentiment;
                validSentimentCount++;
            }

            // Mood Counts
            if (entry.mood) {
                moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            }

            // Distortion Counts
            if (entry.distortions && Array.isArray(entry.distortions)) {
                entry.distortions.forEach(dist => {
                    distortionCounts[dist] = (distortionCounts[dist] || 0) + 1;
                });
            }

            // Create short date
            const dateObj = new Date(entry.createdAt || entry.date);
            const shortDate = 
                !isNaN(dateObj.getTime()) 
                ? `${dateObj.getMonth() + 1}/${dateObj.getDate()}` 
                : 'Invalid';

            return {
                date: shortDate,
                sentiment: isNaN(sentiment) ? 0 : sentiment,
                intensity: Number(entry.intensityScore) || 0
            };
        });

        const avgSent = validSentimentCount > 0 ? (totalSentiment / validSentimentCount).toFixed(2) : 0;

        let maxCount = 0;
        let topMood = 'N/A';
        const pieData = [];
        for (const [mood, count] of Object.entries(moodCounts)) {
            pieData.push({ name: mood, value: count });
            if (count > maxCount) {
                maxCount = count;
                topMood = mood;
            }
        }

        // Create top distortions (Top 5)
        const barData = Object.entries(distortionCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            averageSentiment: avgSent,
            mostFrequentMood: topMood,
            trendData: timelineData,
            moodDistribution: pieData,
            topDistortions: barData
        };

    }, [insights]);

    const getSentimentLabel = (score) => {
        const num = parseFloat(score);
        if (isNaN(num)) return "Unknown";
        if (num >= 0.2) return "Positive";
        if (num <= -0.2) return "Negative";
        return "Neutral";
    };

    const sentimentLabel = insights.length > 0 ? getSentimentLabel(averageSentiment) : "Unknown";

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
             <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-4xl font-heading font-black mb-2 tracking-tight">Your Insights</h1>
            <p className="text-base-content/70 mb-8">A visual summary of your thoughts and emotions.</p>

            {insights.length === 0 ? (
                <div className="text-center p-12 bg-base-200 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-2">Not enough data yet</h3>
                    <p className="text-base-content/70">Start writing journal entries to generate insights.</p>
                </div>
            ) : (
                <>
                    {/* KPI Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-base-100 rounded-3xl shadow-sm border border-base-content/5 flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-md">
                            <h2 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-1">Total Entries Evaluated</h2>
                            <p className="text-4xl font-black text-primary">{insights.length}</p>
                        </div>
                        <div className="p-6 bg-base-100 rounded-3xl shadow-sm border border-base-content/5 flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-md">
                            <h2 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-1">Avg. Sentiment Score</h2>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black text-secondary">{averageSentiment}</p>
                                <span className={`badge ${sentimentLabel === 'Positive' ? 'badge-success' : sentimentLabel === 'Negative' ? 'badge-error' : 'badge-warning'} text-white font-semibold badge-md`}>
                                    {sentimentLabel}
                                </span>
                            </div>
                            <p className="text-xs text-base-content/50 mt-1">Between -1.0 and 1.0</p>
                        </div>
                        <div className="p-6 bg-base-100 rounded-3xl shadow-sm border border-base-content/5 flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-md">
                            <h2 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-1">Most Frequent Mood</h2>
                            <p className="text-4xl font-black text-accent capitalize">{mostFrequentMood}</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sentiment Trend */}
                        <div className="p-6 bg-base-100 rounded-3xl shadow-sm border border-base-content/5 lg:col-span-2">
                            <h2 className="text-xl font-bold mb-4 font-heading">Sentiment Timeline</h2>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1}/>
                                        <XAxis dataKey="date" tick={{fill: 'currentColor', opacity: 0.5}} tickLine={false} axisLine={false} />
                                        <YAxis tick={{fill: 'currentColor', opacity: 0.5}} tickLine={false} axisLine={false} domain={[-1, 1]}/>
                                        <Tooltip 
                                            contentStyle={{backgroundColor: 'oklch(var(--b1))', borderColor: 'oklch(var(--p)/0.2)', borderRadius: '12px'}}
                                            itemStyle={{color: 'currentColor'}}
                                        />
                                        <Area type="monotone" dataKey="sentiment" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSentiment)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Mood Distribution */}
                        <div className="p-6 bg-base-100 rounded-3xl shadow-sm border border-base-content/5">
                            <h2 className="text-xl font-bold mb-4 font-heading">Mood Distribution</h2>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={moodDistribution}
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {moodDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{backgroundColor: 'oklch(var(--b1))', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{fontSize: '14px', paddingTop: '10px'}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Cognitive Distortions */}
                        <div className="p-6 bg-base-100 rounded-3xl shadow-sm border border-base-content/5">
                            <h2 className="text-xl font-bold mb-4 font-heading">Top Cognitive Distortions</h2>
                            {topDistortions.length > 0 ? (
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topDistortions} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" opacity={0.1} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={100} tick={{fill: 'currentColor', fontSize: 12, opacity: 0.8}} tickLine={false} axisLine={false} />
                                            <Tooltip 
                                                cursor={{fill: 'currentColor', opacity: 0.05}} 
                                                contentStyle={{backgroundColor: 'oklch(var(--b1))', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                            />
                                            <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={24}>
                                                {topDistortions.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-base-content/50">
                                    No cognitive distortions detected.
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Insights;