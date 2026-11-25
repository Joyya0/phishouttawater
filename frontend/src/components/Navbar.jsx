
function Navbar({ currentPage, onNavigate, isLoggedIn, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>Phish Outta Water</h2>
      </div>

      <div className="navbar-links">
        {!isLoggedIn ? (
          <>
            <button
              className={currentPage === "login" ? "active" : ""}
              onClick={() => onNavigate("login")}
            >
              Login
            </button>

            <button
              className={currentPage === "register" ? "active" : ""}
              onClick={() => onNavigate("register")}
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            <button
              className={currentPage === "dashboard" ? "active" : ""}
              onClick={() => onNavigate("dashboard")}
            >
              Dashboard
            </button>

            <button
              className={currentPage === "history" ? "active" : ""}
              onClick={() => onNavigate("history")}
            >
              Scan History
            </button>

            <button
              className={currentPage === "account" ? "active" : ""}
              onClick={() => onNavigate("account")}
            >
              Account
            </button>

            <button className="logout-button" onClick={onLogout}>
              Log Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
