import { LuChartNoAxesCombined, LuHouse, LuPenLine } from "react-icons/lu";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
	{ label: 'Home', path: '/dashboard', icon: <LuHouse/> },
	{ label: 'Write', path: '/write', icon: <LuPenLine/> },
	{ label: 'Insights', path: '/insights', icon: <LuChartNoAxesCombined/> },
]

const Sidebar = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/');
	}

	return <>
		<div className="h-screen w-56 bg-base-200 border-r border-base-content/10 flex flex-col p-4 sticky top-0">

			<div className="font-heading border-b-2 text-2xl font-black tracking-tight text-neutral mb-8 px-2">
				equil<span className="text-primary">.</span>
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
						<div className="avatar placeholder">
							<div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
								{user?.name?.charAt(0).toUpperCase()}
							</div>
						</div>
						<div>
							<p className="text-sm font-medium text-neutral leading-tight">{user?.name}</p>
						</div>
					</div>
					<ul tabIndex="-1" className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
						<li><a onClick={handleLogout}>Log out</a></li>
						<li><a>Item 2</a></li>
					</ul>
				</div>
			</div>
		</div>
	</>
}

export default Sidebar;