function Navbar({
    user,
    onLogout,
    onLogin,
    onRegister,
    onHome,
    onDiscover,
    onProjects,
    onProfile
}) {

    return (
        <nav className="navbar">

            <div
                className="navbar-logo"
                onClick={onHome}
            >
                DevConnect
            </div>


            <div className="navbar-links">

                <button
                    className="nav-text-button"
                    onClick={onHome}
                >
                    Home
                </button>


                <button
                    className="nav-text-button"
                    onClick={onDiscover}
                >
                    Discover
                </button>


                <button
                    className="nav-text-button"
                    onClick={onProjects}
                >
                    Projects
                </button>


                {!user && (
                    <>
                        <button
                            className="nav-button login-nav"
                            onClick={onLogin}
                        >
                            Login
                        </button>


                        <button
                            className="nav-button register-nav"
                            onClick={onRegister}
                        >
                            Create Account
                        </button>
                    </>
                )}


                {user && (
                    <>
                        <button
                            className="nav-text-button"
                            onClick={onProfile}
                        >
                            Profile
                        </button>


                        <button
                            className="nav-button logout-button"
                            onClick={onLogout}
                        >
                            Logout
                        </button>
                    </>
                )}

            </div>

        </nav>
    );
}

export default Navbar;