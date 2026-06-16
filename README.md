# PinLeads Status Monitor

A lightweight uptime monitoring service for pinleads.org, built with Next.js and Firebase Firestore. Hosted on Vercel.

## Features

- **Automated Monitoring**: Checks https://pinleads.org every 5 minutes via cron-jobs.com
- **90-Day History**: Stores uptime data for the last 90 days
- **Visual Dashboard**: Displays uptime status with color-coded markers (green/yellow/red)
- **API Access**: Fetch uptime data via `/api/uptime` endpoint
- **Firebase Storage**: Uses Firestore for reliable data persistence

## API Endpoints

### GET /api/uptime
Returns uptime data for the last 90 days.

**Response**:
```json
{
  "overallUptime": 99.5,
  "dailyData": [
    {
      "date": "2024-01-01",
      "uptime": 100,
      "totalChecks": 288,
      "downChecks": 0
    },
    {
      "date": "2024-01-02",
      "uptime": 98.5,
      "totalChecks": 288,
      "downChecks": 4
    },
    {
      "date": "2024-01-03",
      "uptime": 100,
      "totalChecks": 288,
      "downChecks": 0
    }
  ],
  "totalChecks": 25920,
  "lastCheck": {
    "timestamp": 1704067200000,
    "status": "up",
    "responseTime": 245
  }
}
```

## Using the API from External Websites

You can fetch uptime data from any website using the `/api/uptime` endpoint. Here are examples in different formats:

### JavaScript (Fetch API)
```javascript
// Simple fetch
fetch('https://status.pinleads.org/api/uptime')
  .then(response => response.json())
  .then(data => {
    console.log('Overall uptime:', data.overallUptime + '%');
    console.log('Last check status:', data.lastCheck.status);
  })
  .catch(error => console.error('Error:', error));

// With error handling
async function getUptimeData() {
  try {
    const response = await fetch('https://status.pinleads.org/api/uptime');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Display overall uptime
    document.getElementById('uptime').textContent = data.overallUptime.toFixed(2) + '%';
    
    // Display status indicator
    const status = data.overallUptime >= 99 ? '🟢' : data.overallUptime >= 95 ? '🟡' : '🔴';
    document.getElementById('status').textContent = status;
    
  } catch (error) {
    console.error('Failed to fetch uptime data:', error);
  }
}

getUptimeData();
```

### React Example
```jsx
import { useEffect, useState } from 'react';

function UptimeStatus() {
  const [uptime, setUptime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://status.pinleads.org/api/uptime')
      .then(res => res.json())
      .then(data => {
        setUptime(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching uptime:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!uptime) return <div>Unable to load status</div>;

  const statusColor = uptime.overallUptime >= 99 ? 'green' : 
                     uptime.overallUptime >= 95 ? 'yellow' : 'red';

  return (
    <div>
      <div style={{ color: statusColor }}>
        ● {uptime.overallUptime.toFixed(2)}% Uptime
      </div>
      <small>Last check: {new Date(uptime.lastCheck.timestamp).toLocaleString()}</small>
    </div>
  );
}
```

### cURL
```bash
curl https://status.pinleads.org/api/uptime
```

### Python
```python
import requests

response = requests.get('https://status.pinleads.org/api/uptime')
data = response.json()

print(f"Overall uptime: {data['overallUptime']}%")
print(f"Total checks: {data['totalChecks']}")
print(f"Last check status: {data['lastCheck']['status']}")
```

### PHP
```php
<?php
$response = file_get_contents('https://status.pinleads.org/api/uptime');
$data = json_decode($response, true);

echo "Overall uptime: " . $data['overallUptime'] . "%<br>";
echo "Status: " . $data['lastCheck']['status'] . "<br>";
?>
```

### Simple HTML Embed
```html
<div id="uptime-status">Loading...</div>

<script>
fetch('https://status.pinleads.org/api/uptime')
  .then(res => res.json())
  .then(data => {
    const status = data.overallUptime >= 99 ? '🟢' : 
                  data.overallUptime >= 95 ? '🟡' : '🔴';
    document.getElementById('uptime-status').innerHTML = 
      `${status} ${data.overallUptime.toFixed(2)}% Uptime`;
  })
  .catch(() => {
    document.getElementById('uptime-status').textContent = 'Status unavailable';
  });
</script>
```

### Response Fields
- `overallUptime`: Overall uptime percentage (0-100)
- `dailyData`: Array of daily uptime statistics
  - `date`: Date in YYYY-MM-DD format
  - `uptime`: Uptime percentage for that day
  - `totalChecks`: Number of checks performed that day
  - `downChecks`: Number of failed checks that day
- `totalChecks`: Total number of checks over 90 days
- `lastCheck`: Most recent check data
  - `timestamp`: Unix timestamp of the check
  - `status`: "up" or "down"
  - `responseTime`: Response time in milliseconds

### GET /api/cron
Internal endpoint for Vercel cron jobs. Requires `CRON_SECRET` in authorization header.

## Status Colors

- **Green**: ≥99% uptime (Operational)
- **Yellow**: 95-99% uptime (Degraded)
- **Red**: <95% uptime (Outage)

## Tech Stack

- **Next.js 14**: React framework with API routes
- **Firebase Admin SDK**: Firestore integration
- **Tailwind CSS**: Styling
- **Vercel**: Hosting and cron jobs
