"""
Smart Traffic & Parking Management Platform - Backend
FastAPI server with mock data for demonstration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import random
import uvicorn

app = FastAPI(title="Smart Traffic Management API")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================
# MOCK DATA & MODELS
# ==============================================

# Solapur city coordinates (approximate center)
SOLAPUR_CENTER = {"lat": 17.6599, "lng": 75.9064}

# Mock traffic junctions with realistic Solapur locations
TRAFFIC_JUNCTIONS = [
    {"id": 1, "name": "Sakhar Peth Junction", "lat": 17.6712, "lng": 75.9100, "congestion": "low"},
    {"id": 2, "name": "Jule Solapur Chowk", "lat": 17.6599, "lng": 75.9064, "congestion": "medium"},
    {"id": 3, "name": "Railway Station Square", "lat": 17.6715, "lng": 75.9134, "congestion": "high"},
    {"id": 4, "name": "Siddheshwar Temple Junction", "lat": 17.6688, "lng": 75.8990, "congestion": "medium"},
    {"id": 5, "name": "Murarji Peth Circle", "lat": 17.6650, "lng": 75.9010, "congestion": "low"},
    {"id": 6, "name": "Budhwar Peth Crossing", "lat": 17.6620, "lng": 75.9120, "congestion": "high"},
    {"id": 7, "name": "Hotgi Road Junction", "lat": 17.6580, "lng": 75.9180, "congestion": "medium"},
    {"id": 8, "name": "Akkalkot Road Circle", "lat": 17.6540, "lng": 75.9050, "congestion": "low"},
]

# Mock parking zones
PARKING_ZONES = [
    {"id": 1, "name": "Railway Station Parking", "lat": 17.6720, "lng": 75.9140, "total_slots": 150, "available": 45, "illegal_count": 3},
    {"id": 2, "name": "Siddheshwar Temple Parking", "lat": 17.6695, "lng": 75.8985, "total_slots": 200, "available": 120, "illegal_count": 1},
    {"id": 3, "name": "Market Yard Parking", "lat": 17.6600, "lng": 75.9070, "total_slots": 100, "available": 5, "illegal_count": 8},
    {"id": 4, "name": "Murarji Peth Multi-level", "lat": 17.6655, "lng": 75.9015, "total_slots": 300, "available": 180, "illegal_count": 0},
    {"id": 5, "name": "Budhwar Peth Street Parking", "lat": 17.6625, "lng": 75.9125, "total_slots": 80, "available": 10, "illegal_count": 5},
]

# Global state for event mode
EVENT_STATE = {
    "enabled": False,
    "event_type": None,
    "activated_at": None
}

# Demo controls state
DEMO_STATE = {
    "traffic_multiplier": 1.0,
    "active_incidents": []
}

# ==============================================
# PYDANTIC MODELS
# ==============================================

class Junction(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    congestion: str
    vehicle_count: Optional[int] = None
    avg_speed: Optional[float] = None

class ParkingZone(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    total_slots: int
    available: int
    illegal_count: int
    occupancy_rate: Optional[float] = None

class EventMode(BaseModel):
    enabled: bool
    event_type: Optional[str] = None

class DemoControl(BaseModel):
    action: str
    value: Optional[float] = None

class Incident(BaseModel):
    id: int
    type: str
    location: str
    description: str
    severity: str
    timestamp: str

# ==============================================
# HELPER FUNCTIONS
# ==============================================

def calculate_congestion(base_congestion: str) -> str:
    """Apply event mode and demo multiplier to congestion levels"""
    levels = ["low", "medium", "high"]
    base_index = levels.index(base_congestion)
    
    # Event mode increases congestion sensitivity
    if EVENT_STATE["enabled"]:
        base_index = min(base_index + 1, 2)
    
    # Demo traffic multiplier
    if DEMO_STATE["traffic_multiplier"] > 1.5:
        base_index = min(base_index + 1, 2)
    
    return levels[base_index]

def get_enhanced_junctions() -> List[Dict]:
    """Get junctions with calculated stats"""
    enhanced = []
    for junction in TRAFFIC_JUNCTIONS:
        congestion = calculate_congestion(junction["congestion"])
        
        # Calculate mock vehicle counts
        base_vehicles = {"low": 25, "medium": 60, "high": 120}
        vehicle_count = int(base_vehicles[congestion] * DEMO_STATE["traffic_multiplier"])
        
        # Calculate average speed (inverse of congestion)
        avg_speed = {"low": 45, "medium": 25, "high": 12}[congestion]
        
        enhanced.append({
            **junction,
            "congestion": congestion,
            "vehicle_count": vehicle_count,
            "avg_speed": avg_speed
        })
    
    return enhanced

def get_enhanced_parking() -> List[Dict]:
    """Get parking zones with event mode adjustments"""
    enhanced = []
    for zone in PARKING_ZONES:
        available = zone["available"]
        
        # Event mode reduces available parking
        if EVENT_STATE["enabled"]:
            available = int(available * 0.7)
        
        # Calculate occupancy rate
        occupancy_rate = ((zone["total_slots"] - available) / zone["total_slots"]) * 100
        
        enhanced.append({
            **zone,
            "available": max(0, available),
            "occupancy_rate": round(occupancy_rate, 1)
        })
    
    return enhanced

# ==============================================
# API ENDPOINTS
# ==============================================

@app.get("/")
def read_root():
    return {
        "message": "Smart Traffic & Parking Management Platform API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    """Get overall dashboard statistics"""
    junctions = get_enhanced_junctions()
    parking = get_enhanced_parking()
    
    congested_junctions = len([j for j in junctions if j["congestion"] in ["medium", "high"]])
    total_available_parking = sum(p["available"] for p in parking)
    total_illegal_parking = sum(p["illegal_count"] for p in parking)
    active_incidents = len(DEMO_STATE["active_incidents"])
    
    return {
        "congested_junctions": congested_junctions,
        "total_junctions": len(junctions),
        "available_parking_slots": total_available_parking,
        "total_parking_capacity": sum(p["total_slots"] for p in parking),
        "illegal_parking_count": total_illegal_parking,
        "active_incidents": active_incidents,
        "event_mode": EVENT_STATE,
        "last_updated": datetime.now().isoformat()
    }

@app.get("/api/traffic/junctions")
def get_traffic_junctions():
    """Get all traffic junctions with current status"""
    return get_enhanced_junctions()

@app.get("/api/traffic/heatmap")
def get_traffic_heatmap():
    """Get traffic heatmap data for visualization"""
    heatmap_data = []
    for junction in get_enhanced_junctions():
        intensity = {"low": 0.3, "medium": 0.6, "high": 1.0}[junction["congestion"]]
        heatmap_data.append({
            "lat": junction["lat"],
            "lng": junction["lng"],
            "intensity": intensity
        })
    return heatmap_data

@app.get("/api/parking/zones")
def get_parking_zones():
    """Get all parking zones with availability"""
    return get_enhanced_parking()

@app.post("/api/parking/reserve")
def reserve_parking(zone_id: int):
    """Simulate parking reservation"""
    zone = next((z for z in PARKING_ZONES if z["id"] == zone_id), None)
    if not zone:
        raise HTTPException(status_code=404, detail="Parking zone not found")
    
    if zone["available"] <= 0:
        return {
            "success": False,
            "message": "No slots available",
            "zone_name": zone["name"]
        }
    
    # Simulate reservation
    zone["available"] -= 1
    return {
        "success": True,
        "message": f"Slot reserved at {zone['name']}",
        "zone_name": zone["name"],
        "remaining_slots": zone["available"],
        "reservation_code": f"SMC-{random.randint(1000, 9999)}"
    }

@app.get("/api/event-mode")
def get_event_mode():
    """Get current event mode status"""
    return EVENT_STATE

@app.post("/api/event-mode")
def set_event_mode(event_mode: EventMode):
    """Toggle event mode on/off"""
    EVENT_STATE["enabled"] = event_mode.enabled
    EVENT_STATE["event_type"] = event_mode.event_type if event_mode.enabled else None
    EVENT_STATE["activated_at"] = datetime.now().isoformat() if event_mode.enabled else None
    
    return {
        "success": True,
        "event_mode": EVENT_STATE,
        "message": f"Event Mode {'activated' if event_mode.enabled else 'deactivated'}"
    }

@app.get("/api/analytics/traffic-trends")
def get_traffic_trends():
    """Get 24-hour traffic trend data"""
    hours = []
    normal_day = []
    event_day = []
    
    for hour in range(24):
        hours.append(f"{hour:02d}:00")
        
        # Normal day pattern (peak at 9 AM, 1 PM, 6 PM)
        base = 30
        if hour in [8, 9, 10]:
            base = 80 + random.randint(-10, 10)
        elif hour in [12, 13, 14]:
            base = 70 + random.randint(-10, 10)
        elif hour in [17, 18, 19]:
            base = 90 + random.randint(-10, 10)
        elif hour in [20, 21, 22]:
            base = 50 + random.randint(-10, 10)
        else:
            base = 25 + random.randint(-5, 5)
        
        normal_day.append(base)
        
        # Event day (higher and more spread out)
        event_multiplier = 1.5 if 8 <= hour <= 22 else 1.2
        event_day.append(int(base * event_multiplier))
    
    return {
        "labels": hours,
        "datasets": [
            {"name": "Normal Day", "data": normal_day},
            {"name": "Event Day", "data": event_day}
        ]
    }

@app.get("/api/analytics/peak-hours")
def get_peak_hours():
    """Get peak hour comparison"""
    return {
        "morning_peak": {"time": "08:00-10:00", "avg_congestion": 75},
        "afternoon_peak": {"time": "13:00-14:00", "avg_congestion": 65},
        "evening_peak": {"time": "17:00-19:00", "avg_congestion": 85},
        "night": {"time": "20:00-23:00", "avg_congestion": 40}
    }

@app.get("/api/analytics/top-congested")
def get_top_congested():
    """Get top 5 most congested junctions"""
    junctions = get_enhanced_junctions()
    # Sort by congestion level and vehicle count
    congestion_score = {"low": 1, "medium": 2, "high": 3}
    sorted_junctions = sorted(
        junctions, 
        key=lambda x: (congestion_score[x["congestion"]], x["vehicle_count"]), 
        reverse=True
    )[:5]
    
    return sorted_junctions

@app.post("/api/demo/control")
def demo_control(control: DemoControl):
    """Handle demo mode controls"""
    if control.action == "increase_traffic":
        DEMO_STATE["traffic_multiplier"] = control.value or 2.0
        return {"success": True, "message": "Traffic increased", "multiplier": DEMO_STATE["traffic_multiplier"]}
    
    elif control.action == "reset_traffic":
        DEMO_STATE["traffic_multiplier"] = 1.0
        return {"success": True, "message": "Traffic reset to normal"}
    
    elif control.action == "trigger_incident":
        incident_types = ["Illegal Parking", "Road Obstruction", "Traffic Jam", "Vehicle Breakdown"]
        locations = ["Railway Station Square", "Jule Solapur Chowk", "Budhwar Peth Crossing"]
        
        incident = {
            "id": len(DEMO_STATE["active_incidents"]) + 1,
            "type": random.choice(incident_types),
            "location": random.choice(locations),
            "description": "Reported by traffic monitoring system",
            "severity": random.choice(["low", "medium", "high"]),
            "timestamp": datetime.now().isoformat()
        }
        DEMO_STATE["active_incidents"].append(incident)
        return {"success": True, "message": "Incident triggered", "incident": incident}
    
    elif control.action == "clear_incidents":
        DEMO_STATE["active_incidents"] = []
        return {"success": True, "message": "All incidents cleared"}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

@app.get("/api/incidents")
def get_incidents():
    """Get active incidents"""
    return DEMO_STATE["active_incidents"]

# ==============================================
# MAIN
# ==============================================

if __name__ == "__main__":
    print("=" * 60)
    print("Smart Traffic & Parking Management Platform")
    print("Solapur Municipal Corporation - DEMO VERSION")
    print("=" * 60)
    print("\nStarting FastAPI server...")
    print("API Documentation: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
