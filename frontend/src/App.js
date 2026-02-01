/**
 * Main App Component
 * Handles routing and layout
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Parking from './pages/Parking';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <h1>🚦 Smart Traffic Management</h1>
              <p className="subtitle">Solapur Municipal Corporation</p>
            </div>
            <div className="demo-badge">DEMO MODE</div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="app-nav">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/parking" className="nav-link">Parking Zones</Link>
          <Link to="/analytics" className="nav-link">Analytics</Link>
        </nav>

        {/* Main Content */}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/parking" element={<Parking />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
