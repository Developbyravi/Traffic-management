/**
 * Analytics Page
 * Shows traffic trends, peak hours, and insights
 */

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getTrafficTrends, getPeakHours, getTopCongested } from '../services/api';
import './Analytics.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const [trafficTrends, setTrafficTrends] = useState(null);
  const [peakHours, setPeakHours] = useState(null);
  const [topCongested, setTopCongested] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [trendsRes, peakRes, congestedRes] = await Promise.all([
        getTrafficTrends(),
        getPeakHours(),
        getTopCongested()
      ]);

      setTrafficTrends(trendsRes.data);
      setPeakHours(peakRes.data);
      setTopCongested(congestedRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const chartData = trafficTrends ? {
    labels: trafficTrends.labels,
    datasets: trafficTrends.datasets.map((dataset, index) => ({
      label: dataset.name,
      data: dataset.data,
      borderColor: index === 0 ? '#3b82f6' : '#ef4444',
      backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
    }))
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '24-Hour Traffic Comparison',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Traffic Volume'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time of Day'
        }
      }
    }
  };

  const getCongestionColor = (level) => {
    const colors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    return colors[level] || '#6b7280';
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>📊 Traffic Analytics & Insights</h1>
        <p>Data-driven insights for smart traffic management</p>
      </div>

      {/* Traffic Trends Chart */}
      <div className="chart-section">
        <div className="chart-container">
          {chartData && <Line data={chartData} options={chartOptions} />}
        </div>
        <div className="chart-description">
          <h3>Key Insights</h3>
          <ul>
            <li>📈 Event days show 50% higher traffic during peak hours</li>
            <li>🕐 Morning peak (8-10 AM) and evening peak (5-7 PM) are most congested</li>
            <li>🎯 Event mode helps manage increased traffic load</li>
            <li>📉 Night hours (11 PM - 6 AM) show minimal congestion</li>
          </ul>
        </div>
      </div>

      {/* Peak Hours Analysis */}
      <div className="peak-hours-section">
        <h2>⏰ Peak Hour Analysis</h2>
        <div className="peak-hours-grid">
          <div className="peak-card">
            <div className="peak-icon">🌅</div>
            <h3>Morning Peak</h3>
            <div className="peak-time">{peakHours?.morning_peak.time}</div>
            <div className="peak-congestion">
              <div className="congestion-bar">
                <div 
                  className="congestion-fill"
                  style={{ 
                    width: `${peakHours?.morning_peak.avg_congestion}%`,
                    backgroundColor: '#f59e0b'
                  }}
                />
              </div>
              <span>{peakHours?.morning_peak.avg_congestion}% Avg Congestion</span>
            </div>
          </div>

          <div className="peak-card">
            <div className="peak-icon">☀️</div>
            <h3>Afternoon Peak</h3>
            <div className="peak-time">{peakHours?.afternoon_peak.time}</div>
            <div className="peak-congestion">
              <div className="congestion-bar">
                <div 
                  className="congestion-fill"
                  style={{ 
                    width: `${peakHours?.afternoon_peak.avg_congestion}%`,
                    backgroundColor: '#22c55e'
                  }}
                />
              </div>
              <span>{peakHours?.afternoon_peak.avg_congestion}% Avg Congestion</span>
            </div>
          </div>

          <div className="peak-card">
            <div className="peak-icon">🌆</div>
            <h3>Evening Peak</h3>
            <div className="peak-time">{peakHours?.evening_peak.time}</div>
            <div className="peak-congestion">
              <div className="congestion-bar">
                <div 
                  className="congestion-fill"
                  style={{ 
                    width: `${peakHours?.evening_peak.avg_congestion}%`,
                    backgroundColor: '#ef4444'
                  }}
                />
              </div>
              <span>{peakHours?.evening_peak.avg_congestion}% Avg Congestion</span>
            </div>
          </div>

          <div className="peak-card">
            <div className="peak-icon">🌙</div>
            <h3>Night</h3>
            <div className="peak-time">{peakHours?.night.time}</div>
            <div className="peak-congestion">
              <div className="congestion-bar">
                <div 
                  className="congestion-fill"
                  style={{ 
                    width: `${peakHours?.night.avg_congestion}%`,
                    backgroundColor: '#22c55e'
                  }}
                />
              </div>
              <span>{peakHours?.night.avg_congestion}% Avg Congestion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Congested Junctions */}
      <div className="top-congested-section">
        <h2>🚦 Top 5 Most Congested Junctions</h2>
        <div className="congested-list">
          {topCongested.map((junction, index) => (
            <div key={junction.id} className="congested-item">
              <div className="rank-badge">{index + 1}</div>
              <div className="junction-info">
                <h4>{junction.name}</h4>
                <div className="junction-details">
                  <span>🚗 {junction.vehicle_count} vehicles</span>
                  <span>⚡ {junction.avg_speed} km/h avg speed</span>
                </div>
              </div>
              <div 
                className="congestion-indicator"
                style={{ backgroundColor: getCongestionColor(junction.congestion) }}
              >
                {junction.congestion.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h2>💡 Smart Recommendations</h2>
        <div className="recommendations-grid">
          <div className="recommendation-card">
            <div className="rec-icon">🚦</div>
            <h4>Signal Timing Optimization</h4>
            <p>Adjust signal timings at Railway Station Square and Budhwar Peth to reduce congestion by 25%</p>
            <button className="rec-action">View Details</button>
          </div>

          <div className="recommendation-card">
            <div className="rec-icon">🅿️</div>
            <h4>Parking Capacity Increase</h4>
            <p>Market Yard Parking is frequently full. Consider adding 50 more slots or temporary zones during events</p>
            <button className="rec-action">View Details</button>
          </div>

          <div className="recommendation-card">
            <div className="rec-icon">🎯</div>
            <h4>Event Mode Activation</h4>
            <p>Upcoming festival detected. Activate Event Mode 2 hours before to prepare for increased traffic</p>
            <button className="rec-action">View Details</button>
          </div>

          <div className="recommendation-card">
            <div className="rec-icon">📱</div>
            <h4>Public Awareness</h4>
            <p>Send notifications to citizens about alternate routes during peak hours to distribute traffic</p>
            <button className="rec-action">View Details</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
