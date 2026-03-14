import { Link } from 'react-router-dom';

const Navbar = ({ onFeaturesClick, onHowItWorksClick }) => {

	return (
		<div className="navbar sticky top-0 z-50 bg-base-100/85 backdrop-blur-md shadow-sm border-b border-base-content/5">
			<div className="navbar-start">
				<a className="btn btn-ghost normal-case px-2">
					<span className="font-heading text-2xl font-black tracking-tight text-neutral">
						equil<span className="text-primary">.</span>
					</span>
				</a>
			</div>

			<div className="navbar-center hidden md:flex">

				<ul className="menu menu-horizontal gap-1 px-1">
					<li><a className="font-sans text-sm font-medium text-neutral/70 hover:text-neutral hover:bg-base-200 rounded-full" onClick={(e) => {
						e.preventDefault();
						onFeaturesClick();
					}}>Features</a></li>
					<li><a className="font-sans text-sm font-medium text-neutral/70 hover:text-neutral hover:bg-base-200 rounded-full" onClick={(e) => {
						e.preventDefault();
						onHowItWorksClick();
					}}>How it works</a></li>
					<li><a className="font-sans text-sm font-medium text-neutral/70 hover:text-neutral hover:bg-base-200 rounded-full">Pricing</a></li>
				</ul>
			</div>

			<div className="navbar-end gap-2">
				<Link to="/login">
					<button className="btn btn-ghost btn-sm rounded-full font-sans font-medium text-sm sm:flex">
						Login
					</button>
				</Link>
				<Link to="/register">
					<button className="btn btn-primary btn-sm rounded-full font-sans font-semibold text-sm shadow-md shadow-primary/30">
						Get started free
					</button>
				</Link>
			</div>
		</div>
	);
};

export default Navbar;