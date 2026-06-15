# PinLeads Status API

## Overview

The PinLeads Status API provides real-time uptime monitoring data for pinleads.org. External applications can fetch uptime statistics, daily history, and the latest status check.

## Base URL

```
https://pinleads.org/api/uptime
```

## Authentication

No authentication required. The API is publicly accessible.

## Endpoints

### GET /api/uptime

Fetches uptime data for the last 90 days.

#### Response Format

```json
{
  "overallUptime": 99.95,
  "dailyData": [
    {
      "date": "2026-06-14",
      "uptime": 100,
      "totalChecks": 288,
      "downChecks": 0
    },
    {
      "date": "2026-06-13",
      "uptime": 99.65,
      "totalChecks": 288,
      "downChecks": 1
    }
  ],
  "totalChecks": 25920,
  "lastCheck": {
    "timestamp": 1781335083543,
    "status": "up",
    "responseTime": 18,
    "url": "https://pinleads.org",
    "createdAt": "2026-06-14T07:18:03.543Z"
  }
}
```

#### Response Fields

- **overallUptime** (number): Overall uptime percentage for the last 90 days (0-100)
- **dailyData** (array): Array of daily uptime statistics
  - **date** (string): Date in YYYY-MM-DD format
  - **uptime** (number): Uptime percentage for that day (0-100)
  - **totalChecks** (number): Total number of checks performed that day
  - **downChecks** (number): Number of failed checks that day
- **totalChecks** (number): Total number of checks over the last 90 days
- **lastCheck** (object): Most recent uptime check
  - **timestamp** (number): Unix timestamp in milliseconds
  - **status** (string): Either "up" or "down"
  - **responseTime** (number): Response time in milliseconds
  - **url** (string): The URL that was checked
  - **createdAt** (string): ISO timestamp of when the check was performed

## Usage Examples

### JavaScript/TypeScript

```javascript
// Fetch uptime data
async function getUptimeData() {
  try {
    const response = await fetch('https://pinleads.org/api/uptime');
    const data = await response.json();
    
    console.log(`Overall uptime: ${data.overallUptime}%`);
    console.log(`Total checks: ${data.totalChecks}`);
    console.log(`Last check status: ${data.lastCheck.status}`);
    
    return data;
  } catch (error) {
    console.error('Failed to fetch uptime data:', error);
  }
}

// Display daily uptime
function displayDailyUptime(data) {
  data.dailyData.forEach(day => {
    const status = day.uptime >= 99 ? '✅' : day.uptime >= 95 ? '⚠️' : '❌';
    console.log(`${status} ${day.date}: ${day.uptime.toFixed(2)}% (${day.downChecks} downtime)`);
  });
}
```

### Python

```python
import requests

def get_uptime_data():
    try:
        response = requests.get('https://pinleads.org/api/uptime')
        data = response.json()
        
        print(f"Overall uptime: {data['overallUptime']}%")
        print(f"Total checks: {data['totalChecks']}")
        print(f"Last check status: {data['lastCheck']['status']}")
        
        return data
    except Exception as error:
        print(f"Failed to fetch uptime data: {error}")

def display_daily_uptime(data):
    for day in data['dailyData']:
        if day['uptime'] >= 99:
            status = '✅'
        elif day['uptime'] >= 95:
            status = '⚠️'
        else:
            status = '❌'
        print(f"{status} {day['date']}: {day['uptime']:.2f}% ({day['downChecks']} downtime)")
```

### cURL

```bash
curl https://pinleads.org/api/uptime
```

### PHP

```php
<?php
function getUptimeData() {
    $response = file_get_contents('https://pinleads.org/api/uptime');
    $data = json_decode($response, true);
    
    echo "Overall uptime: " . $data['overallUptime'] . "%\n";
    echo "Total checks: " . $data['totalChecks'] . "\n";
    echo "Last check status: " . $data['lastCheck']['status'] . "\n";
    
    return $data;
}

function displayDailyUptime($data) {
    foreach ($data['dailyData'] as $day) {
        if ($day['uptime'] >= 99) {
            $status = '✅';
        } elseif ($day['uptime'] >= 95) {
            $status = '⚠️';
        } else {
            $status = '❌';
        }
        echo "{$status} {$day['date']}: {$day['uptime']}% ({$day['downChecks']} downtime)\n";
    }
}
?>
```

## Display Guidelines

### Status Colors

- **Green (≥99%)**: Service is operational
- **Yellow (95-99%)**: Service is degraded
- **Red (<95%)**: Service is experiencing outages

### Important Notes

1. **Days with no data**: Days before monitoring started will show 100% uptime with 0 total checks. These should be displayed as green or skipped entirely.

2. **Current day**: The current day's data is calculated from individual checks in real-time and may not be complete until the day ends.

3. **Caching**: The API returns fresh data on each request. Consider implementing client-side caching to reduce API calls.

4. **Error handling**: Always handle potential API errors gracefully in your application.

## Integration Example: Simple Status Badge

```html
<!DOCTYPE html>
<html>
<head>
    <title>PinLeads Status</title>
    <style>
        .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: bold;
        }
        .status-up { background-color: #10b981; color: white; }
        .status-degraded { background-color: #f59e0b; color: white; }
        .status-down { background-color: #ef4444; color: white; }
    </style>
</head>
<body>
    <div id="status-badge" class="status-badge">Loading...</div>
    
    <script>
        async function updateStatus() {
            try {
                const response = await fetch('https://pinleads.org/api/uptime');
                const data = await response.json();
                
                const badge = document.getElementById('status-badge');
                const uptime = data.overallUptime;
                
                if (uptime >= 99) {
                    badge.className = 'status-badge status-up';
                    badge.textContent = `Operational (${uptime.toFixed(2)}%)`;
                } else if (uptime >= 95) {
                    badge.className = 'status-badge status-degraded';
                    badge.textContent = `Degraded (${uptime.toFixed(2)}%)`;
                } else {
                    badge.className = 'status-badge status-down';
                    badge.textContent = `Outage (${uptime.toFixed(2)}%)`;
                }
            } catch (error) {
                console.error('Failed to fetch status:', error);
                document.getElementById('status-badge').textContent = 'Status Unknown';
            }
        }
        
        updateStatus();
        // Update every 5 minutes
        setInterval(updateStatus, 300000);
    </script>
</body>
</html>
```

## Rate Limiting

Currently, there are no strict rate limits. However, please be considerate and don't make excessive requests. A reasonable refresh interval is 1-5 minutes.

## Support

For issues or questions about the API, contact PinLeads support at https://pinleads.org/support
