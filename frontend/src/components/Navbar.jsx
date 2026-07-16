import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand" id="navbar-brand">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 10H26" stroke="currentColor" strokeWidth="2"/>
            <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
            <path d="M8 16H20M8 20H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>JobTracker</span>
        </Link>
        <div className="navbar-right">
          {user && (
            <>
              <span className="navbar-user" id="navbar-username">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 16C3 13.2386 5.23858 11 8 11H10C12.7614 11 15 13.2386 15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {user.username}
              </span>
              <button className="btn btn-ghost" onClick={handleLogout} id="logout-btn">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M12 13L16 9M16 9L12 5M16 9H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 2H4C2.89543 2 2 2.89543 2 4V14C2 15.1046 2.89543 16 4 16H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
