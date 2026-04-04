import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LuSparkles } from "react-icons/lu";

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

const DashHeader = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })

    return (
        <div className="flex justify-between items-start m-5 gap-4">
            <h1 className="font-heading text-2xl md:text-4xl font-bold text-neutral">{getGreeting()}, <br></br><span className="text-primary">{user.name}</span>!</h1>
            <div className="flex flex-col items-end gap-2">
                <p className="font-data text-sm text-neutral/60">
                    {today}
                </p>
                <div className="chat-cta-card" onClick={() => navigate('/chat')}>
                    <div className="chat-cta-icon">
                        <LuSparkles size={16} />
                    </div>
                    <div className="text-left">
                        <p className="font-data text-xs font-semibold text-neutral">Talk to Therapist</p>
                        <p className="font-data text-[10px] text-neutral/50">CBT-based AI support</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashHeader