# Cache System Documentation

## Overview

This application implements a background cache system that:
- Caches API responses from the third-party link service using Redis
- Serves cached data for faster response times
- Automatically revalidates stale cache in the background
- Can be refreshed hourly via cron job

## Architecture

### Components

1. **Cache Module** (`src/lib/cache.ts`)
   - Redis-based persistent cache storage
   - TTL-based expiration (1 hour)
   - Cache statistics and management functions
   - Automatic connection management

2. **API Routes**
   - `/api/links` - Main links endpoint with cache integration
   - `/api/cache/refresh` - Cache refresh endpoint for cron jobs
   - `/api/cache/status` - Cache status and statistics

### How It Works

1. **Initial Request**: When `/api/links` is called, it checks Redis cache first
2. **Cache Hit**: If valid cache exists, return immediately with `X-Cache-Status: HIT`
3. **Stale Cache**: If cache is stale (>50 minutes old), serve it but trigger background revalidation
4. **Cache Miss**: If no cache exists, fetch from API, cache in Redis, return with `X-Cache-Status: MISS`
5. **Hourly Refresh**: External cron job calls `/api/cache/refresh` to update cache

## Cache Behavior

- **Cache Duration**: 1 hour (3600 seconds)
- **Stale Threshold**: 50 minutes (cache is considered stale after this)
- **Cacheable Requests**: Only page 1 requests without search parameters
- **Non-cacheable**: Pagination (page > 1) and search requests bypass cache
- **Storage**: Redis for persistent, distributed caching

## Redis Setup

### Environment Variable

Add the Redis connection URL to your environment variables:

```env
REDIS_URL=redis://localhost:6379
```

For production deployments, use your Redis provider's connection URL. Popular options include:

- **Upstash Redis**: `redis://default:****@*******.upstash.io:6379`
- **Redis Cloud**: `redis://default:****@*******.redis.cloud:6379`
- **Railway**: `redis://:****@*******.railway.app:6379`
- **Vercel KV**: Use `@vercel/kv` instead (requires different setup)

### Local Development

For local development, you can run Redis using Docker:

```bash
docker run -d -p 6379:6379 redis:alpine
```

Or install Redis locally:
- **macOS**: `brew install redis && brew services start redis`
- **Ubuntu/Debian**: `sudo apt-get install redis-server`
- **Windows**: Use WSL2 or Docker

## Setting Up Hourly Cron Job

You need to set up an external service to call the cache refresh endpoint every hour.

### Option 1: Vercel Cron (Recommended for Vercel deployments)

1. Create a `vercel.json` file in the project root:

```json
{
  "crons": [
    {
      "path": "/api/cache/refresh",
      "schedule": "0 * * * *"
    }
  ]
}
```

2. Deploy to Vercel - the cron job will automatically be configured

### Option 2: GitHub Actions

1. Create `.github/workflows/cache-refresh.yml`:

```yaml
name: Cache Refresh

on:
  schedule:
    # Run every hour at minute 0
    - cron: '0 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  refresh-cache:
    runs-on: ubuntu-latest
    steps:
      - name: Refresh Cache
        run: |
          curl -X GET https://your-domain.com/api/cache/refresh
```

2. Replace `your-domain.com` with your actual domain
3. Commit and push the workflow file

### Option 3: External Cron Service

Use services like:
- **cron-job.org**
- **EasyCron**
- **UptimeRobot** (with keyword monitoring)

Configure them to call:
```
GET https://your-domain.com/api/cache/refresh
```

Every hour (Cron expression: `0 * * * *`)

### Option 4: Server-side Cron (For self-hosted deployments)

If you're running on a traditional server:

```bash
# Add to crontab
0 * * * * curl -X GET https://your-domain.com/api/cache/refresh
```

## API Endpoints

### GET /api/cache/refresh

Refreshes the cache with fresh data from the third-party API.

**Response:**
```json
{
  "success": true,
  "message": "Cache refreshed successfully",
  "timestamp": "2026-01-14T05:52:00.000Z",
  "stats": {
    "before": { "hasCache": true, "age": 3500, "expiresIn": 100, "isStale": true },
    "after": { "hasCache": true, "age": 0, "expiresIn": 3600, "isStale": false }
  },
  "itemsCount": 50
}
```

### POST /api/cache/refresh

Manually refresh cache with custom parameters.

**Request Body:**
```json
{
  "page": 1,
  "per_page": 100
}
```

### GET /api/cache/status

Get current cache status and statistics.

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-01-14T05:52:00.000Z",
  "cache": {
    "hasCache": true,
    "age": 1800,
    "expiresIn": 1800,
    "isStale": false
  }
}
```

## Testing the Cache System

### 1. Check Cache Status
```bash
curl https://your-domain.com/api/cache/status
```

### 2. Manually Refresh Cache
```bash
curl https://your-domain.com/api/cache/refresh
```

### 3. Test Links Endpoint
```bash
# First request - should be cache MISS
curl -I https://your-domain.com/api/links
# Look for: X-Cache-Status: MISS

# Second request - should be cache HIT
curl -I https://your-domain.com/api/links
# Look for: X-Cache-Status: HIT
```

### 4. Monitor Cache Headers

Check the `X-Cache-Status` header in responses:
- `HIT` - Served from cache
- `MISS` - Fetched from API and cached
- `BYPASS` - Not cacheable (pagination/search)

## Security Considerations

### Optional: Add Authentication to Cache Refresh

To prevent unauthorized cache refreshes, you can add authentication:

1. Add to `.env`:
```env
CRON_SECRET=your-secret-key-here
```

2. Uncomment the auth code in `/api/cache/refresh/route.tsx`:
```typescript
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
    });
}
```

3. Update your cron job to include the header:
```bash
curl -X GET https://your-domain.com/api/cache/refresh \
  -H "Authorization: Bearer your-secret-key-here"
```

## Monitoring

### Cache Performance Metrics

Monitor these metrics to ensure optimal cache performance:

1. **Cache Hit Rate**: Percentage of requests served from cache
2. **Cache Age**: How old the cache is (check via `/api/cache/status`)
3. **Revalidation Success**: Monitor logs for successful background revalidations
4. **Redis Connection**: Monitor Redis connection health and latency

### Logs

The cache system logs important events:
- `[Redis] Connected successfully`
- `[Redis] Cache updated successfully`
- `[Cache Refresh] Starting cache refresh...`
- `[Cache Refresh] Cache refreshed successfully`
- `[Links API] Serving from cache`
- `[Links API] Cache is stale, triggering background revalidation`
- `[Links API] Cache miss, fetching from API`

## Benefits of Redis Cache

### Advantages Over In-Memory Cache

1. **Persistent Storage**: 
   - Cache survives server restarts and redeployments
   - Works perfectly in serverless environments (Vercel, AWS Lambda)
   - No cold start cache misses

2. **Distributed Caching**:
   - Shared cache across all instances
   - Perfect for multi-instance deployments
   - High cache hit rate regardless of load balancing

3. **Scalability**:
   - Can handle high traffic with ease
   - Redis clusters for even more performance
   - Built-in eviction policies

4. **Production Ready**:
   - Battle-tested in production environments
   - Reliable and fast
   - Easy to monitor and debug

## Troubleshooting

### Cache Not Working

1. Check cache status: `GET /api/cache/status`
2. Verify cache refresh endpoint works: `GET /api/cache/refresh`
3. Check server logs for error messages
4. Ensure REDIS_URL environment variable is set correctly
5. Verify Redis server is running and accessible

### Redis Connection Issues

If you see Redis connection errors:

1. Verify REDIS_URL is correct
2. Check Redis server is running: `redis-cli ping` (should return PONG)
3. Ensure network connectivity to Redis server
4. Check firewall rules if using remote Redis
5. Verify authentication credentials if required

### High API Usage

If you notice high API usage despite caching:

1. Verify cron job is running correctly
2. Check cache expiration time
3. Monitor for cache bypass scenarios (pagination, search)
4. Check Redis memory usage and eviction policy

### Stale Data

If data appears stale:

1. Manually trigger cache refresh: `GET /api/cache/refresh`
2. Verify cron job schedule
3. Check cache TTL settings in `src/lib/cache.ts`
4. Verify Redis TTL is set correctly

## Configuration

### Adjusting Cache TTL

To change cache duration, edit `src/lib/cache.ts`:

```typescript
// Change from 1 hour to 2 hours
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
```

### Adjusting Stale Threshold

To change when cache is considered stale:

```typescript
// Change from 83% to 50% of TTL
export function isCacheStale(): boolean {
    // ...
    return age > CACHE_TTL * 0.50; // Stale after 50% of TTL
}
```

## Future Enhancements

Potential improvements for the cache system:

1. **Redis Integration**: Add Redis for distributed caching
2. **Cache Warming**: Pre-populate cache on deployment
3. **Selective Invalidation**: Invalidate specific cache entries
4. **Cache Analytics**: Track hit rates, performance metrics
5. **Multi-tier Caching**: Combine in-memory + Redis + CDN
6. **Cache Versioning**: Handle schema changes gracefully
