import { LuChartNoAxesCombined, LuHouse, LuPenLine, LuUser, LuShieldCheck } from "react-icons/lu";
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';

const navItems = [
    { label: 'Home', path: '/dashboard', icon: <LuHouse /> },
    { label: 'Write', path: '/write', icon: <LuPenLine /> },
    { label: 'Insights', path: '/insights', icon: <LuChartNoAxesCombined /> },
    { label: 'Profile', path: '/profile', icon: <LuUser /> },
]

const BottomNav = () => {
    const { user } = useAuth();
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-content/10 flex items-center justify-around px-2 py-2 md:hidden">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all text-xs font-medium
                        ${isActive
                            ? 'text-primary'
                            : 'text-neutral/40 hover:text-neutral'
                        }`
                    }
                >
                    <span className="text-xl">{item.icon}</span>
                    {item.label}
                </NavLink>
            ))}
            {user?.role === 'admin' && (
                <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all text-xs font-medium
                        ${isActive ? 'text-primary' : 'text-neutral/40 hover:text-neutral'}`
                    }
                >
                    <span className="text-xl"><LuShieldCheck /></span>
                    Admin
                </NavLink>
            )}
        </div>
    )
}

export default BottomNav