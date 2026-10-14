# API Caching Documentation

## Overview

The API routes in this application use Next.js standard caching methodology to improve performance and reduce load on external services.

## Cached Routes

The following GET routes are cached with automatic revalidation:

### `/api/route.tsx`

- **Cache Duration**: 60 seconds
- **Description**: Basic hello world endpoint

### `/api/links/route.tsx`

- **Cache Duration**: 60 seconds
- **Description**: Returns list of links with optional query parameters

### `/api/details/[slug]/route.tsx`

- **Cache Duration**: 60 seconds
- **Description**: Returns details for a specific link by slug

### `/api/comments/[id]/route.tsx`

- **Cache Duration**: 30 seconds
- **Description**: Returns comments for a specific link ID

## Manual Cache Revalidation

You can manually revalidate cached paths using the revalidation endpoint:

### `GET /api/revalidate`

**Query Parameters:**

- `path` (required unless `all=true`): The path to revalidate (e.g., "/", "/slug-name")
- `tag` (optional): The cache tag to revalidate (e.g., "links", "comments")
- `type` (optional): Either "page" or "layout" (defaults to "page")
- `all` (optional): `true` clears every cache in the app: all cache tags (`links`, `signals`) expire immediately and every route is revalidated. The **Clear All Cache** button in `/hq` uses this.

**Success Response (200):**

```json
{
    "revalidated": true,
    "path": "/",
    "now": 1234567890
}
```

**Error Response (400):**

```json
{
    "revalidated": false,
    "now": 1234567890,
    "message": "Missing path parameter"
}
```

**Example Usage:**

```bash
# Revalidate the home page and links cache
curl -X GET https://pockets.msar.me/api/revalidate?path=/&tag=links

# Clear all caches
curl -X GET "https://pockets.msar.me/api/revalidate?all=true"

# Revalidate a specific link detail page
curl -X GET https://pockets.msar.me/api/revalidate?path=/some-slug-name
```

## Signals Provider Cache

Signal provider results (file listings and file contents from GitHub or artifacts) are cached for 1 day with the Next.js 16 `"use cache"` directive (`cacheLife` + `cacheTag`) under the `signals` tag, so the GitHub API rate limit (60 requests/hour unauthenticated) is not hit by regular traffic. Failed requests are not cached.

## Cache Tags

The following cache tags are used across the application:

- `links`: Applied to all links data fetching (getLinks, getLinkBySlug)
- `signals`: Applied to all signal provider data (listings, signal files, RSS feeds)
- Use these tags with the revalidate endpoint to invalidate specific caches

## How Caching Works

1. **Route Segment Config**: Each cached route exports a `revalidate` constant that defines the cache duration in seconds.

2. **Fetch API Caching**: Internal API calls use the `next: { revalidate }` option in fetch requests to enable Next.js Data Cache.

3. **Automatic Revalidation**: After the specified duration, the next request will trigger a background revalidation of the cache.

4. **Manual Revalidation**: Use the `/api/revalidate` endpoint to immediately purge the cache for a specific path.

## Benefits

- **Improved Performance**: Reduced response times for frequently accessed data
- **Lower External API Load**: Fewer requests to external services
- **Stale-While-Revalidate**: Users get fast responses while cache updates in the background
- **Manual Control**: Ability to force cache updates when needed

## References

- [Next.js Data Cache](https://nextjs.org/docs/app/guides/caching#data-cache)
- [Next.js revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
