import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [trackingInfo, setTrackingInfo] = useState(null);

  useEffect(() => {
    // Check if user came from email click
    const urlParams = new URLSearchParams(window.location.search);
    const tracked = urlParams.get('tracked');
    const status = urlParams.get('status');
    
    if (tracked && status === 'success') {
      setNotification('✅ Email click tracked successfully!');
      fetchTrackingInfo(tracked);
      // Auto-refresh stats after tracking
      setTimeout(fetchStats, 1000);
    }
    
    fetchStats();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrackingInfo = async (trackingId) => {
    try {
      const response = await axios.get(`${API_BASE}/track-info/${trackingId}`);
      setTrackingInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch tracking info');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`);
      console.log('Fetched stats:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE}/send-email`, emailData);
      setNotification(`📧 Email sent! Tracking ID: ${response.data.trackingId}`);
      setEmailData({ to: '', subject: '', message: '' });
      fetchStats();
    } catch (error) {
      setNotification('❌ Failed to send email');
    }
    
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="App">
      <header className="header">
        <h1>📧 Email Tracking System</h1>
        <p>Send tracked emails and monitor clicks in real-time</p>
      </header>

      {trackingInfo && (
        <div className="tracking-success">
          <h2>🎉 Email Click Detected!</h2>
          <p><strong>Email:</strong> {trackingInfo.email}</p>
          <p><strong>Subject:</strong> {trackingInfo.subject}</p>
          <p><strong>Clicked At:</strong> {new Date(trackingInfo.clicked_at).toLocaleString()}</p>
        </div>
      )}

      {notification && (
        <div className="notification">
          {notification}
          <button onClick={() => setNotification('')}>×</button>
        </div>
      )}

      <div className="container">
        <div className="send-section">
          <h2>📤 Send Tracked Email</h2>
          <form onSubmit={sendEmail}>
            <input
              type="email"
              name="to"
              placeholder="Recipient email"
              value={emailData.to}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Email subject"
              value={emailData.subject}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="message"
              placeholder="Email message"
              value={emailData.message}
              onChange={handleInputChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? '📤 Sending...' : '📧 Send Tracked Email'}
            </button>
          </form>
        </div>

        <div className="stats-section">
          <div className="stats-header">
            <h2>📊 Email Statistics</h2>
            <button onClick={fetchStats} className="refresh-btn">🔄 Refresh</button>
          </div>
          
          <div className="stats-summary">
            <div className="stat-card">
              <h3>{stats.length}</h3>
              <p>Total Emails</p>
            </div>
            <div className="stat-card">
              <h3>{stats.filter(s => s.clicked).length}</h3>
              <p>Clicked</p>
            </div>
            <div className="stat-card">
              <h3>{((stats.filter(s => s.clicked).length / stats.length) * 100 || 0).toFixed(1)}%</h3>
              <p>Click Rate</p>
            </div>
          </div>

          <div className="stats-table">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Sent</th>
                  <th>Status</th>
                  <th>Clicked At</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.id} className={stat.clicked ? 'clicked' : 'pending'}>
                    <td>{stat.email}</td>
                    <td>{stat.subject}</td>
                    <td>{new Date(stat.sent_at).toLocaleString()}</td>
                    <td>
                      <span className={`status ${stat.clicked ? 'clicked' : 'pending'}`}>
                        {stat.clicked ? '✅ Clicked' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>{stat.clicked_at ? new Date(stat.clicked_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;