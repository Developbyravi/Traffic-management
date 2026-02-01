/**
 * Parking Page
 * Displays parking zones with availability and reservation
 */

import React, { useState, useEffect } from 'react';
import { getParkingZones, reserveParking } from '../services/api';
import './Parking.css';

function Parking() {
  const [parkingZones, setParkingZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchParkingZones();
    const interval = setInterval(fetchParkingZones, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchParkingZones = async () => {
    try {
      const response = await getParkingZones();
      setParkingZones(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching parking zones:', error);
      setLoading(false);
    }
  };

  const handleReserve = async (zoneId, zoneName) => {
    try {
      const response = await reserveParking(zoneId);
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `✅ ${response.data.message}. Code: ${response.data.reservation_code}`
        });
        fetchParkingZones();
      } else {
        setMessage({
          type: 'error',
          text: `❌ ${response.data.message}`
        });
      }
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      console.error('Error reserving parking:', error);
      setMessage({
        type: 'error',
        text: '❌ Failed to reserve parking'
      });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const getOccupancyStatus = (rate) => {
    if (rate < 50) return { label: 'Low', color: '#22c55e' };
    if (rate < 80) return { label: 'Medium', color: '#f59e0b' };
    return { label: 'High', color: '#ef4444' };
  };

  if (loading) {
    return <div className="loading">Loading parking zones...</div>;
  }

  return (
    <div className="parking-page">
      <div className="page-header">
        <h1>🅿️ Smart Parking Zones</h1>
        <p>Real-time parking availability and reservation system</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="parking-stats">
        <div className="parking-stat-card">
          <h3>Total Zones</h3>
          <div className="stat-number">{parkingZones.length}</div>
        </div>
        <div className="parking-stat-card">
          <h3>Total Capacity</h3>
          <div className="stat-number">
            {parkingZones.reduce((sum, zone) => sum + zone.total_slots, 0)}
          </div>
        </div>
        <div className="parking-stat-card">
          <h3>Available Now</h3>
          <div className="stat-number">
            {parkingZones.reduce((sum, zone) => sum + zone.available, 0)}
          </div>
        </div>
        <div className="parking-stat-card">
          <h3>Illegal Parking</h3>
          <div className="stat-number alert">
            {parkingZones.reduce((sum, zone) => sum + zone.illegal_count, 0)}
          </div>
        </div>
      </div>

      <div className="parking-zones-grid">
        {parkingZones.map((zone) => {
          const status = getOccupancyStatus(zone.occupancy_rate);
          const isAvailable = zone.available > 0;

          return (
            <div key={zone.id} className="parking-zone-card">
              <div className="zone-header">
                <h3>{zone.name}</h3>
                <span 
                  className="occupancy-badge" 
                  style={{ backgroundColor: status.color }}
                >
                  {status.label} Occupancy
                </span>
              </div>

              <div className="zone-stats">
                <div className="zone-stat">
                  <div className="zone-stat-label">Total Slots</div>
                  <div className="zone-stat-value">{zone.total_slots}</div>
                </div>
                <div className="zone-stat">
                  <div className="zone-stat-label">Available</div>
                  <div className="zone-stat-value available">{zone.available}</div>
                </div>
                <div className="zone-stat">
                  <div className="zone-stat-label">Occupied</div>
                  <div className="zone-stat-value">{zone.total_slots - zone.available}</div>
                </div>
              </div>

              <div className="zone-progress">
                <div 
                  className="zone-progress-bar"
                  style={{ 
                    width: `${zone.occupancy_rate}%`,
                    backgroundColor: status.color
                  }}
                />
              </div>
              <div className="zone-progress-label">
                {zone.occupancy_rate}% Occupied
              </div>

              {zone.illegal_count > 0 && (
                <div className="illegal-alert">
                  ⚠️ {zone.illegal_count} illegal parking detected - enforcement required
                </div>
              )}

              <div className="zone-actions">
                <button
                  className={`reserve-btn ${!isAvailable ? 'disabled' : ''}`}
                  onClick={() => handleReserve(zone.id, zone.name)}
                  disabled={!isAvailable}
                >
                  {isAvailable ? '🎫 Reserve Slot' : '❌ Full'}
                </button>
                <button className="directions-btn">
                  📍 Get Directions
                </button>
              </div>

              <div className="zone-location">
                📍 Location: {zone.lat.toFixed(4)}°N, {zone.lng.toFixed(4)}°E
              </div>
            </div>
          );
        })}
      </div>

      <div className="parking-info-section">
        <h2>Parking Guidance System</h2>
        <div className="info-grid">
          <div className="info-card">
            <h4>🔍 Real-time Availability</h4>
            <p>Check live parking availability before you arrive. Save time and reduce congestion.</p>
          </div>
          <div className="info-card">
            <h4>🎫 Easy Reservation</h4>
            <p>Reserve your parking spot in advance. Get a confirmation code instantly.</p>
          </div>
          <div className="info-card">
            <h4>🚨 Enforcement Alerts</h4>
            <p>Automatic detection of illegal parking. Alerts sent to enforcement teams.</p>
          </div>
          <div className="info-card">
            <h4>📊 Smart Analytics</h4>
            <p>Data-driven insights help optimize parking zones and reduce violations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Parking;
