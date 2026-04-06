import { LuChartNoAxesCombined, LuHouse, LuPenLine, LuSun, LuMoon, LuSparkles, LuShieldCheck } from "react-icons/lu";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import Avatar from 'boring-avatars';

const navItems = [
	{ label: 'Home', path: '/dashboard', icon: <LuHouse /> },
	{ label: 'Write', path: '/write', icon: <LuPenLine /> },
	{ label: 'Insights', path: '/insights', icon: <LuChartNoAxesCombined /> },
	{ label: 'Therapist', path: '/chat', icon: <LuSparkles /> },
]

const Sidebar = () => {
	const { user, logout } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/');
	}

	const handleViewProfile = () => {
		navigate('/profile');
		document.activeElement.blur();
	}

	return <>
		<div className="h-screen w-56 bg-base-200 border-r border-base-content/10 flex flex-col p-4 sticky top-0">

			<div className="flex items-center justify-between border-b-2 mb-8 px-2 pb-2">
				<div className="font-heading text-2xl font-black tracking-tight text-neutral">
					equil<span className="text-primary">.</span>
				</div>
                <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm text-neutral/60 hover:text-neutral">
					{theme === 'luxury' ? <LuSun size={18} /> : <LuMoon size={18} />}
				</button>
			</div>

			<nav className="flex flex-col gap-1 flex-1 font-data">
				{navItems.map((item) => (
					<NavLink
						key={item.path}
						to={item.path}
						className={({ isActive }) =>
							`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                            ${isActive
								? 'bg-primary/10 text-primary'
								: 'text-neutral/60 hover:text-neutral hover:bg-base-200'
							}`
						}
					>
						<span className="text-base">{item.icon}</span>
						{item.label}
					</NavLink>
				))}
			</nav>

			<div className="divider"></div>
			<div className="flex items-center justify-center">
				<div className="dropdown dropdown-top dropdown-center">
					<div tabIndex={0} role="button" className="btn m-1">
						{user?.avatar ? (
							<div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-base-content/10">
								<img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
							</div>
						) : (
							<div className="shrink-0 overflow-hidden rounded-full border border-base-content/10">
								<Avatar
									size={32}
									name={user?.name}
									variant="beam"
									colors={['#c4a882', '#7a5c3a', '#f5ede0', '#3d2b1f', '#e8d8c4']}
								/>
							</div>
						)}
						<div className="text-left overflow-hidden">
							<p className="text-sm font-medium text-neutral leading-tight truncate">{user?.name}</p>
						</div>
					</div>
					<ul tabIndex="-1" className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
						<li><a onClick={handleLogout}>Log out</a></li>
						<li><a onClick={handleViewProfile}>View Profile</a></li>
						{user?.role === 'admin' && (
							<li><a onClick={() => { navigate('/admin'); document.activeElement.blur(); }}>
								<LuShieldCheck size={14} /> Admin Panel
							</a></li>
						)}
					</ul>
				</div>
			</div>
		</div>
	</>
}

export default Sidebar;