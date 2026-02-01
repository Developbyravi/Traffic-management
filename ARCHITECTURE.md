# System Architecture

## Overview

The Smart Traffic & Parking Management Platform follows a modern **client-server architecture** with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Application (Port 3000)            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │  Dashboard  │  │   Parking   │  │  Analytics  │  │  │
│  │  │   Page      │  │    Page     │  │    Page     │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │  │
│  │         │                 │                 │         │  │
│  │         └─────────────────┴─────────────────┘         │  │
│  │                           │                           │  │
│  │                    ┌──────▼──────┐                    │  │
│  │                    │  API Client │                    │  │
│  │                    │  (Axios)    │                    │  │
│  │                    └──────┬──────┘                    │  │
│  └───────────────────────────┼───────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                               │ HTTP/REST
                               │
┌──────────────────────────────▼────────────────────────────────┐
│                         BACKEND                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           FastAPI Server (Port 8000)                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │   Traffic    │  │   Parking    │  │  Analytics  │ │  │
│  │  │   Routes     │  │   Routes     │  │   Routes    │ │  │
│  │  └──────┬───────┘  └──────┬───────┘  └─────┬───────┘ │  │
│  │         │                  │                │         │  │
│  │         └──────────────────┴────────────────┘         │  │
│  │                           │                           │  │
│  │                    ┌──────▼──────┐                    │  │
│  │                    │  Mock Data  │                    │  │
│  │                    │  Generator  │                    │  │
│  │                    └─────────────┘                    │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Technology: FastAPI (Python)

**File:** `backend/main.py`

#### Key Components:

1. **Mock Data Stores**
   - `TRAFFIC_JUNCTIONS` - 8 traffic junctions with real Solapur locations
   - `PARKING_ZONES` - 5 parking zones with capacity details
   - `EVENT_STATE` - Global state for event mode
   - `DEMO_STATE` - Tracks demo controls (traffic multiplier, incidents)

2. **Helper Functions**
   - `calculate_congestion()` - Applies event mode and traffic multipliers
   - `get_enhanced_junctions()` - Enriches junction data with calculated stats
   - `get_enhanced_parking()` - Adjusts parking based on event mode

3. **API Routes**

   **Dashboard Routes:**
   - `GET /api/dashboard/stats` - Overall statistics
   
   **Traffic Routes:**
   - `GET /api/traffic/junctions` - All junctions with congestion
   - `GET /api/traffic/heatmap` - Heatmap data for visualization
   
   **Parking Routes:**
   - `GET /api/parking/zones` - All parking zones
   - `POST /api/parking/reserve` - Reserve a parking slot
   
   **Event Mode Routes:**
   - `GET /api/event-mode` - Get current event mode status
   - `POST /api/event-mode` - Toggle event mode on/off
   
   **Analytics Routes:**
   - `GET /api/analytics/traffic-trends` - 24-hour traffic patterns
   - `GET /api/analytics/peak-hours` - Peak hour analysis
   - `GET /api/analytics/top-congested` - Top 5 congested junctions
   
   **Demo Control Routes:**
   - `POST /api/demo/control` - Handle demo actions
   - `GET /api/incidents` - Get active incidents

4. **CORS Middleware**
   - Allows cross-origin requests from frontend (port 3000)
   - Required for local development

#### Logic Flow Example: Event Mode

```python
# When Event Mode is activated:
1. User clicks "Activate Event Mode" in frontend
2. Frontend sends POST to /api/event-mode with { enabled: true, event_type: "Festival" }
3. Backend updates EVENT_STATE global variable
4. calculate_congestion() now adds +1 to congestion levels
5. get_enhanced_parking() reduces available parking by 30%
6. Frontend auto-refreshes every 5 seconds, sees updated data
7. Event banner appears, stats update, map colors change
```

---

## Frontend Architecture

### Technology: React 18

#### Directory Structure:

```
frontend/src/
├── pages/              # Main application pages
│   ├── Dashboard.js    # Main dashboard with map
│   ├── Dashboard.css   # Dashboard styles
│   ├── Parking.js      # Parking zones page
│   ├── Parking.css     # Parking styles
│   ├── Analytics.js    # Analytics & insights
│   └── Analytics.css   # Analytics styles
├── services/
│   └── api.js         # API client (Axios)
├── App.js             # Main app with routing
├── App.css            # Global app styles
├── index.js           # React entry point
└── index.css          # Base CSS
```

#### Key Components:

### 1. Dashboard Page (`pages/Dashboard.js`)

**Purpose:** Main command center for traffic management

**Features:**
- Live traffic map using Leaflet
- Stats cards (congested junctions, parking, incidents)
- Event mode toggle with event type selector
- Demo controls panel
- Active incidents list

**State Management:**
```javascript
- stats: Dashboard statistics
- junctions: Array of traffic junctions
- parkingZones: Array of parking zones
- eventMode: Current event mode state
- incidents: Active incidents array
- Auto-refresh: Every 5 seconds
```

**Map Integration:**
- Uses `react-leaflet` for map rendering
- OpenStreetMap tiles for base map
- CircleMarkers for junctions (color-coded by congestion)
- Regular Markers for parking zones
- Popup windows with detailed information

### 2. Parking Page (`pages/Parking.js`)

**Purpose:** Manage parking zones and reservations

**Features:**
- Parking statistics summary
- Grid of parking zone cards
- Real-time availability tracking
- Reservation system with confirmation codes
- Illegal parking alerts
- Occupancy progress bars

**Reservation Flow:**
```javascript
1. User clicks "Reserve Slot" button
2. handleReserve() sends POST to /api/parking/reserve
3. Backend decrements available count
4. Returns confirmation code (SMC-XXXX)
5. Success message displayed to user
6. Page refreshes parking data
```

### 3. Analytics Page (`pages/Analytics.js`)

**Purpose:** Data visualization and insights

**Features:**
- 24-hour traffic trend line chart (Chart.js)
- Peak hour comparison cards
- Top 5 congested junctions ranking
- Smart recommendations grid

**Chart Configuration:**
```javascript
- Uses Chart.js with react-chartjs-2
- Two datasets: Normal Day vs Event Day
- Realistic peak patterns (morning, afternoon, evening)
- Responsive and interactive
```

### 4. API Service (`services/api.js`)

**Purpose:** Centralized API communication

**Structure:**
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// All API functions return axios promises
export const getDashboardStats = () => api.get('/api/dashboard/stats');
export const setEventMode = (enabled, eventType) => 
  api.post('/api/event-mode', { enabled, event_type: eventType });
// ... etc
```

**Benefits:**
- Single source of truth for API endpoints
- Easy to modify base URL for production
- Consistent error handling
- Type-safe with proper exports

---

## Data Flow

### Example: Activating Event Mode

```
┌─────────────┐
│   User      │
│ (Dashboard) │
└──────┬──────┘
       │ Selects "Festival"
       │ Clicks "Activate Event Mode"
       ▼
┌─────────────────────────┐
│  Dashboard Component    │
│  handleEventModeToggle()│
└──────┬──────────────────┘
       │ setEventMode(true, "Festival")
       ▼
┌─────────────────────────┐
│     API Service         │
│  POST /api/event-mode   │
└──────┬──────────────────┘
       │ HTTP Request
       ▼
┌─────────────────────────┐
│   FastAPI Backend       │
│  set_event_mode()       │
└──────┬──────────────────┘
       │ Update EVENT_STATE
       │ {"enabled": true, "event_type": "Festival"}
       ▼
┌─────────────────────────┐
│  calculate_congestion() │
│  increases congestion   │
└──────┬──────────────────┘
       │ Return success response
       ▼
┌─────────────────────────┐
│  Dashboard Component    │
│  fetchData()            │
└──────┬──────────────────┘
       │ GET /api/dashboard/stats
       │ GET /api/traffic/junctions
       │ GET /api/parking/zones
       ▼
┌─────────────────────────┐
│  UI Updates             │
│  - Event banner appears │
│  - Map colors change    │
│  - Stats update         │
└─────────────────────────┘
```

---

## Event Mode Implementation

### Backend Logic (`backend/main.py`)

```python
def calculate_congestion(base_congestion: str) -> str:
    """
    Applies event mode to congestion calculation
    """
    levels = ["low", "medium", "high"]
    base_index = levels.index(base_congestion)
    
    # EVENT MODE EFFECT: Increase congestion by one level
    if EVENT_STATE["enabled"]:
        base_index = min(base_index + 1, 2)  # Cap at 'high'
    
    # Demo traffic multiplier effect
    if DEMO_STATE["traffic_multiplier"] > 1.5:
        base_index = min(base_index + 1, 2)
    
    return levels[base_index]

def get_enhanced_parking() -> List[Dict]:
    """
    Adjusts parking based on event mode
    """
    enhanced = []
    for zone in PARKING_ZONES:
        available = zone["available"]
        
        # EVENT MODE EFFECT: Reduce available parking by 30%
        if EVENT_STATE["enabled"]:
            available = int(available * 0.7)
        
        enhanced.append({
            **zone,
            "available": max(0, available),
            "occupancy_rate": calculate_occupancy(zone, available)
        })
    
    return enhanced
```

### Why This Matters:

**Real-world Application:**
- During festivals, more people travel → higher congestion
- Temporary parking restrictions reduce available spots
- Earlier signal changes needed due to increased traffic
- Emergency routes must be kept clear

**Demo Value:**
- Shows adaptive system behavior
- Demonstrates smart city concepts
- Proves scalability and flexibility
- Highlights innovation beyond basic monitoring

---

## Color Coding System

### Traffic Congestion:
- 🟢 **Green (#22c55e)** - Low congestion (0-40 vehicles)
- 🟡 **Yellow (#f59e0b)** - Medium congestion (41-80 vehicles)
- 🔴 **Red (#ef4444)** - High congestion (80+ vehicles)

### Parking Occupancy:
- 🟢 **Green** - Below 50% occupied
- 🟡 **Yellow** - 50-79% occupied
- 🔴 **Red** - 80%+ occupied

### Incident Severity:
- 🟢 **Low** - Minor issues, no immediate action
- 🟡 **Medium** - Requires monitoring
- 🔴 **High** - Urgent response needed

---

## Performance Optimizations

1. **Auto-refresh Strategy:**
   - Dashboard: 5 seconds (frequent updates)
   - Parking: 5 seconds (moderate)
   - Analytics: 10 seconds (less critical)

2. **Data Efficiency:**
   - Only essential data in API responses
   - No heavy database queries (mock data)
   - Client-side calculations minimized

3. **UI Responsiveness:**
   - CSS transitions for smooth animations
   - Hover effects for better UX
   - Loading states to prevent layout shifts

---

## Security Considerations

### For Production Deployment:

1. **Authentication:**
   - Add JWT tokens for API access
   - Role-based access (admin, operator, viewer)

2. **API Security:**
   - Rate limiting
   - Input validation (currently uses Pydantic)
   - HTTPS only

3. **Data Protection:**
   - Encrypt sensitive parking data
   - Audit logs for all changes
   - Secure WebSocket for real-time updates

---

## Scalability

### How to Scale:

1. **More Junctions:**
   - Add entries to `TRAFFIC_JUNCTIONS` array
   - No code changes needed

2. **More Parking Zones:**
   - Add entries to `PARKING_ZONES` array
   - Automatically appears in UI

3. **More Event Types:**
   - Add to event type dropdown
   - Extend `calculate_congestion()` logic

4. **Real Sensors:**
   - Replace mock data functions with database queries
   - Connect to IoT sensor APIs
   - Add camera feed integration

---

## Testing the Application

### Manual Testing Checklist:

- [ ] Backend starts without errors
- [ ] Frontend loads dashboard
- [ ] Map displays with junctions
- [ ] Clicking junction shows popup
- [ ] Event mode toggle works
- [ ] Event banner appears/disappears
- [ ] Demo controls increase traffic
- [ ] Incidents trigger and display
- [ ] Parking page loads
- [ ] Parking reservation works
- [ ] Analytics charts render
- [ ] Page navigation works
- [ ] Auto-refresh updates data

---

## Summary

This architecture provides:

✅ **Separation of Concerns** - Frontend/Backend clearly divided  
✅ **Scalability** - Easy to add features and data  
✅ **Maintainability** - Clean code structure with comments  
✅ **Demo-friendly** - Interactive controls for presentations  
✅ **Production-ready Pattern** - Can be extended with real data sources

The Event Mode feature is the **killer feature** that sets this apart from basic traffic monitoring systems!
