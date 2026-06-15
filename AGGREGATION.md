# Uptime Data Aggregation

This system optimizes database reads by aggregating daily uptime data into single documents per day, reducing reads from ~25,920 documents (90 days × 5-minute intervals) to ~90 documents (one per day).

## How It Works

### Data Flow

1. **Individual Checks**: Every 5 minutes, uptime checks are stored in the `uptime_checks` collection (raw data)
2. **Daily Aggregation**: Once a day is complete, the data is aggregated into a single document in the `daily_uptime` collection
3. **Status Page**: The status page reads from `daily_uptime` for completed days and only reads individual checks for the current day

### Collections

- `uptime_checks`: Raw individual uptime checks (every 5 minutes)
- `daily_uptime`: Aggregated daily statistics (one document per day)

## API Endpoints

### POST /api/aggregate

Triggers aggregation of uptime data.

**Query Parameters:**
- `date`: Aggregate a specific date (YYYY-MM-DD format)
- `startDate`: Start date for range aggregation (YYYY-MM-DD format)
- `endDate`: End date for range aggregation (YYYY-MM-DD format)
- `all`: If `true`, aggregates all missing days from the last aggregated date to yesterday

**Examples:**

```bash
# Aggregate yesterday (default)
curl -X POST http://localhost:3000/api/aggregate

# Aggregate a specific date
curl -X POST http://localhost:3000/api/aggregate?date=2026-06-14

# Aggregate a date range
curl -X POST http://localhost:3000/api/aggregate?startDate=2026-06-01&endDate=2026-06-14

# Aggregate all missing days
curl -X POST http://localhost:3000/api/aggregate?all=true
```

### GET /api/uptime

Fetches uptime data for the status page. Now optimized to read from aggregated data.

**Changes:**
- Reads from `daily_uptime` collection for completed days (last 90 days)
- Only reads individual checks from `uptime_checks` for the current day
- Calculates overall uptime from aggregated data + today's checks

## Setup

### Initial Backfill

To backfill existing data with the new aggregation system:

```bash
# Aggregate all existing data from 90 days ago to yesterday
curl -X POST http://localhost:3000/api/aggregate?all=true
```

### Scheduled Aggregation

Set up a cron job or scheduled task to run daily aggregation after each day completes:

**Example cron (runs at 00:05 UTC each day):**
```
5 0 * * * curl -X POST https://your-domain.com/api/aggregate
```

**Vercel Cron Job (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/aggregate",
      "schedule": "0 5 * * *"
    }
  ]
}
```

## Performance Impact

### Before
- **Reads per status page load**: ~25,920 documents (90 days × 288 checks/day)
- **Cost**: High Firestore read operations

### After
- **Reads per status page load**: ~90 documents (89 aggregated days + today's individual checks)
- **Cost**: ~99.65% reduction in Firestore read operations

## Daily Aggregation Document Structure

```typescript
{
  date: string;           // YYYY-MM-DD
  uptime: number;        // Percentage (0-100)
  totalChecks: number;    // Total checks for the day
  upChecks: number;       // Successful checks
  downChecks: number;     // Failed checks
  aggregatedAt: string;  // ISO timestamp of when aggregation ran
}
```

## Maintenance

### Monitoring

Monitor the aggregation process by checking:
1. Firestore `daily_uptime` collection for new documents
2. API response from `/api/aggregate` for success/failure

### Troubleshooting

**Missing days in status page:**
- Run `/api/aggregate?all=true` to backfill missing days
- Check that cron job/scheduled task is running correctly

**Incorrect uptime calculations:**
- Verify individual checks in `uptime_checks` for the affected date
- Re-aggregate the specific date: `/api/aggregate?date=YYYY-MM-DD`
