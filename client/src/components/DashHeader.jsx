import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

const quotes = [
    "Small steps lead to big changes.",
    "Focus on progress, not perfection.",
    "Your only limit is your mind.",
    "Simplicity is the ultimate sophistication.",
    "Consistency is what transforms average into excellence.",
    "Build today for the life you want tomorrow."
];

const DashHeader = () => {
    const { user } = useAuth();
    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })
    const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

    return (
        <div className="flex justify-between m-5">
            <h1 className="font-heading text-2xl md:text-4xl font-bold text-neutral">{getGreeting()}, <br></br><span className="text-primary">{user.name}</span>!</h1>
            <p className="font-data text-base ">
                {today} <br></br> <span className="font-handwriting text-xl">"{quote}"</span>
            </p>
        </div>
    )
}

export default DashHeader