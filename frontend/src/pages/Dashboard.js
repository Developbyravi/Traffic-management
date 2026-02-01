/**
 * Dashboard Page
 * Main view with traffic map, stats, and event mode controls
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import {
  getDashboardStats,
  getTrafficJunctions,
  getParkingZones,
  getEventMode,
  setEventMode,
  demoControl,
  getIncidents
} from '../services/api';
import './Dashboard.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [junctions, setJunctions] = useState([]);
  const [parkingZones, setParkingZones] = useState([]);
  const [eventMode, setEventModeState] = useState({ enabled: false, event_type: null });
  const [selectedEventType, setSelectedEventType] = useState('Festival');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Solapur center coordinates
  const center = [17.6599, 75.9064];

  // Fetch data
  const fetchData = async () => {
    try {
      const [statsRes, junctionsRes, parkingRes, eventRes, incidentsRes] = await Promise.all([
        getDashboardStats(),
        getTrafficJunctions(),
        getParkingZones(),
        getEventMode(),
        getIncidents()
      ]);

      setStats(statsRes.data);
      setJunctions(junctionsRes.data);
      setParkingZones(parkingRes.data);
      setEventModeState(eventRes.data);
      setIncidents(incidentsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle event mode toggle
  const handleEventModeToggle = async () => {
    try {
      const newEnabled = !eventMode.enabled;
      await setEventMode(newEnabled, newEnabled ? selectedEventType : null);
      fetchData();
    } catch (error) {
      console.error('Error toggling event mode:', error);
    }
  };

  // Demo controls
  const handleIncreaseTraffic = async () => {
    try {
      await demoControl('increase_traffic', 2.0);
      fetchData();
    } catch (error) {
      console.error('Error increasing traffic:', error);
    }
  };

  const handleResetTraffic = async () => {
    try {
      await demoControl('reset_traffic');
      fetchData();
    } catch (error) {
      console.error('Error resetting traffic:', error);
    }
  };

  const handleTriggerIncident = async () => {
    try {
      await demoControl('trigger_incident');
      fetchData();
    } catch (error) {
      console.error('Error triggering incident:', error);
    }
  };

  // Get congestion color
  const getCongestionColor = (level) => {
    const colors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    return colors[level] || '#6b7280';
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      {/* Event Mode Banner */}
      {eventMode.enabled && (
        <div className="event-banner">
          🎯 EVENT MODE ACTIVE: {eventMode.event_type} - Traffic sensitivity increased, parking rules adjusted
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚦</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.congested_junctions}/{stats?.total_junctions}</div>
            <div className="stat-label">Congested Junctions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🅿️</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.available_parking_slots}/{stats?.total_parking_capacity}</div>
            <div className="stat-label">Available Parking</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.illegal_parking_count}</div>
            <div className="stat-label">Illegal Parking</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.active_incidents}</div>
            <div className="stat-label">Active Incidents</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Left Panel - Map */}
        <div className="map-section">
          <div className="section-header">
            <h2>Live Traffic Map</h2>
          </div>
          
          <MapContainer center={center} zoom={13} className="map-container">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Traffic Junctions */}
            {junctions.map((junction) => (
              <CircleMarker
                key={junction.id}
                center={[junction.lat, junction.lng]}
                radius={12}
                pathOptions={{
                  color: getCongestionColor(junction.congestion),
                  fillColor: getCongestionColor(junction.congestion),
                  fillOpacity: 0.6,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <strong>{junction.name}</strong>
                    <div>Status: <span style={{ color: getCongestionColor(junction.congestion) }}>
                      {junction.congestion.toUpperCase()}
                    </span></div>
                    <div>Vehicles: {junction.vehicle_count}</div>
                    <div>Avg Speed: {junction.avg_speed} km/h</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Parking Zones */}
            {parkingZones.map((zone) => (
              <Marker key={zone.id} position={[zone.lat, zone.lng]}>
                <Popup>
                  <div className="map-popup">
                    <strong>🅿️ {zone.name}</strong>
                    <div>Available: {zone.available}/{zone.total_slots}</div>
                    <div>Occupancy: {zone.occupancy_rate}%</div>
                    {zone.illegal_count > 0 && (
                      <div style={{ color: '#ef4444' }}>⚠️ {zone.illegal_count} illegal parking</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="map-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#22c55e' }}></span>
              Low Congestion
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
              Medium Congestion
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
              High Congestion
            </div>
          </div>
        </div>

        {/* Right Panel - Controls & Incidents */}
        <div className="controls-section">
          {/* Event Mode Control */}
          <div className="control-panel event-mode-panel">
            <h3>🎯 Event Mode</h3>
            <p className="control-description">
              Adjust traffic sensitivity and parking rules for special events
            </p>
            
            <div className="event-type-selector">
              <label>Event Type:</label>
              <select 
                value={selectedEventType} 
                onChange={(e) => setSelectedEventType(e.target.value)}
                disabled={eventMode.enabled}
              >
                <option>Festival</option>
                <option>Market Day</option>
                <option>School/Exam Hours</option>
                <option>Emergency/VIP Movement</option>
              </select>
            </div>

            <button
              className={`event-toggle-btn ${eventMode.enabled ? 'active' : ''}`}
              onClick={handleEventModeToggle}
            >
              {eventMode.enabled ? '✅ Deactivate Event Mode' : '▶️ Activate Event Mode'}
            </button>

            {eventMode.enabled && (
              <div className="event-info">
                <div>Active: {eventMode.event_type}</div>
                <div className="text-sm">Since: {new Date(eventMode.activated_at).toLocaleTimeString()}</div>
              </div>
            )}
          </div>

          {/* Demo Controls */}
          <div className="control-panel demo-panel">
            <h3>🎮 Demo Controls</h3>
            <p className="control-description">
              Simulate traffic conditions and incidents
            </p>
            
            <div className="demo-buttons">
              <button onClick={handleIncreaseTraffic} className="demo-btn">
                📈 Increase Traffic
              </button>
              <button onClick={handleResetTraffic} className="demo-btn">
                🔄 Reset Traffic
              </button>
              <button onClick={handleTriggerIncident} className="demo-btn">
                🚨 Trigger Incident
              </button>
            </div>
          </div>

          {/* Active Incidents */}
          <div className="control-panel incidents-panel">
            <h3>🚨 Active Incidents ({incidents.length})</h3>
            {incidents.length === 0 ? (
              <p className="no-incidents">No active incidents</p>
            ) : (
              <div className="incidents-list">
                {incidents.map((incident) => (
                  <div key={incident.id} className={`incident-item severity-${incident.severity}`}>
                    <div className="incident-header">
                      <strong>{incident.type}</strong>
                      <span className={`severity-badge ${incident.severity}`}>
                        {incident.severity}
                      </span>
                    </div>
                    <div className="incident-location">📍 {incident.location}</div>
                    <div className="incident-time">
                      {new Date(incident.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
