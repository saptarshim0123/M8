import { useEffect, useState } from 'react';
import { getEntries } from '../api/entryAPI';
import { getAllAnalyses } from '../api/analyzeAPI';

const StatCards = () => {
    const [statsData, setStatsData] = useState([
        { id: 0, title: "Current Streak", value: "-", unit: "days" },
        { id: 1, title: "Total Entries", value: "-", unit: "all time" },
        { id: 2, title: "Top Mood", value: "-", unit: "all time" },
        { id: 3, title: "Longest Streak", value: "-", unit: "days" },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [entriesRes, analysesRes] = await Promise.all([
                    getEntries(),
                    getAllAnalyses()
                ]);

                const entries = entriesRes.data || [];
                const analyses = analysesRes.data || [];

                // 1. Total Entries
                const totalEntries = entries.length;

                // 2. Streaks Calculation
                const dates = entries.map(e => new Date(e.createdAt).setHours(0,0,0,0));
                const uniqueDates = [...new Set(dates)].sort((a,b) => a - b);
                
                let currentStreak = 0;
                let longestStreak = 0;
                let tempStreak = 0;

                const today = new Date().setHours(0,0,0,0);
                const oneDay = 24 * 60 * 60 * 1000;

                if (uniqueDates.length > 0) {
                    tempStreak = 1;
                    longestStreak = 1;
                    for (let i = 1; i < uniqueDates.length; i++) {
                        if (uniqueDates[i] - uniqueDates[i-1] === oneDay) {
                            tempStreak++;
                            longestStreak = Math.max(longestStreak, tempStreak);
                        } else {
                            tempStreak = 1;
                        }
                    }

                    const lastDate = uniqueDates[uniqueDates.length - 1];
                    if (today - lastDate <= oneDay) {
                        currentStreak = 1;
                        for (let i = uniqueDates.length - 2; i >= 0; i--) {
                            if (uniqueDates[i + 1] - uniqueDates[i] === oneDay) {
                                currentStreak++;
                            } else {
                                break;
                            }
                        }
                    }
                }

                // 3. Top Mood
                let topMood = "N/A";
                if (analyses.length > 0) {
                    const moodCounts = {};
                    let maxCount = 0;
                    analyses.forEach(a => {
                        if (a.mood) {
                            moodCounts[a.mood] = (moodCounts[a.mood] || 0) + 1;
                            if (moodCounts[a.mood] > maxCount) {
                                maxCount = moodCounts[a.mood];
                                topMood = a.mood;
                            }
                        }
                    });
                }

                setStatsData([
                    { id: 0, title: "Current Streak", value: currentStreak, unit: "days" },
                    { id: 1, title: "Total Entries", value: totalEntries, unit: "all time" },
                    { id: 2, title: "Top Mood", value: topMood === "N/A" ? "N/A" : topMood.charAt(0).toUpperCase() + topMood.slice(1), unit: "all time" },
                    { id: 3, title: "Longest Streak", value: longestStreak, unit: "days" },
                ]);

            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full font-data p-4">
            {statsData.map((stat) => (
                <div key={stat.id} className="stat bg-base-200 shadow border border-base-content/5 rounded-2xl hover:-translate-y-1 transition-all">
                    <div className="stat-title text-xs md:text-sm">{stat.title}</div>
                    <div className="stat-value text-2xl md:text-4xl text-primary capitalize">{stat.value}</div>
                    <div className="stat-desc mt-1 opacity-50">{stat.unit}</div>
                </div>
            ))}
        </div>
    );
}

export default StatCards;