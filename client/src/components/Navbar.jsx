const Navbar = () => {
    return <>
        <div className="navbar  sticky top-0 bg-base-100 shadow-sm">
            <div class="navbar-start">
                <a class="btn btn-ghost normal-case text-xl">equil</a>
            </div>
            <div className="navbar-end space-x-4">
                <button className="btn btn-success ">Register</button>
                <button className="btn btn-outline ">Login</button>
            </div>
        </div>
    </>
}

export default Navbar;