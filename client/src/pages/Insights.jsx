import { useEffect, useState } from 'react';
import { getAllAnalyses } from '../api/analyzeAPI';

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

    if (loading) return <div>Loading insights...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-heading font-black mb-6">Your Insights</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-base-100 rounded-xl shadow-sm border border-base-content/10">
                    <h2 className="text-xl font-bold mb-2">Total Analyses</h2>
                    <p className="text-3xl text-primary">{insights.length}</p>
                </div>

            </div>
        </div>
    );
};

export default Insights;