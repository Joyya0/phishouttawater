
function Dashboard({ user, onNavigate, onAnalyze }) {
  const username = user?.username || user?.email?.split("@")[0] || "User";

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {username}!</h1>
          <p>Stay safe by checking suspicious emails before interacting with them.</p>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h2>Email Analyzer</h2>
          <p>
            Check an email for suspicious links, misleading language,
            and other signs of phishing.
          </p>
          <button onClick={onAnalyze}>
            Analyze an Email
          </button>
        </div>

        <div className="dashboard-card">
          <h2>Scan History</h2>
          <p>
            Review your previous email scans and their risk levels.
          </p>
          <button onClick={() => onNavigate("history")}>
            View History
          </button>
        </div>

        <div className="dashboard-card">
          <h2>Account Settings</h2>
          <p>
            View and manage your account information.
          </p>
          <button onClick={() => onNavigate("account")}>
            Manage Account
          </button>
        </div>
      </div>

      <div className="dashboard-tip">
        <h2>Stay Alert</h2>
        <p>
          Be careful with unexpected attachments, unfamiliar links,
          and messages asking for personal information.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
