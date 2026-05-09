import React, { useState, useEffect } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import UploadItem from "./UploadItem";
import ClaimItem from "./ClaimItem";
import Login from "./Login";
import ClaimChat from "./ClaimChat";

axios.defaults.baseURL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [activeChatClaimId, setActiveChatClaimId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // ✅ On app load: restore user session AND set JWT token in axios headers
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    console.log("React API URL: ", process.env.REACT_APP_API_BASE_URL);

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        // Restore JWT token for all future axios requests
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${storedToken}`;
      } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setCurrentView("dashboard");
  };

  const handleItemUploaded = () => {
    setRefreshTrigger((prev) => prev + 1);
    setCurrentView("dashboard");
  };

  const goToDashboard = () => {
    setCurrentView("dashboard");
    setMenuOpen(false);
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (!user) return <Login onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Lost & Found</h1>
          <p className="subtitle">Find or Report Your Lost Items</p>
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Open menu"
        >
          ☰
        </button>
        <div className="header-actions">
          {currentView !== "dashboard" && (
            <button className="back-to-home-btn" onClick={goToDashboard}>
              ← Back to Dashboard
            </button>
          )}
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div
        className={`mobile-drawer-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div className="mobile-drawer-header">
          <span className="user-name">{user.name}</span>
          <button
            className="drawer-close-btn"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>
        {currentView !== "dashboard" && (
          <button className="back-to-home-btn" onClick={goToDashboard}>
            ← Back to Dashboard
          </button>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div className="main-content">
        {currentView === "dashboard" && (
          <Dashboard
            onViewUpload={() => setCurrentView("upload")}
            onViewClaim={() => setCurrentView("claim")}
            onOpenChat={(claimId) => {
              setActiveChatClaimId(claimId);
              setCurrentView("chat");
            }}
            user={user}
          />
        )}
        {currentView === "upload" && (
          <UploadItem onItemUploaded={handleItemUploaded} user={user} />
        )}
        {currentView === "claim" && (
          <ClaimItem refreshTrigger={refreshTrigger} user={user} />
        )}
        {currentView === "chat" && activeChatClaimId && (
          <ClaimChat
            claimId={activeChatClaimId}
            user={user}
            onBack={() => setCurrentView("dashboard")}
          />
        )}
      </div>

      <footer className="app-footer">
        <p>&copy; 2026 Lost & Found. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
