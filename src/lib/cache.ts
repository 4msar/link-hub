/**
 * Cache utility for storing and managing API responses
 * Provides in-memory caching with TTL-based validation
 */

import { LinksResponse } from "@/types/link";

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface CacheStore {
    links: CacheEntry<LinksResponse> | null;
}

// In-memory cache store
const cache: CacheStore = {
    links: null,
};

// Cache configuration
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const STALE_THRESHOLD = 0.83; // Consider cache stale after 83% of TTL

/**
 * Get cached links data
 * @returns Cached links data or null if not found or expired
 */
export function getCachedLinks(): LinksResponse | null {
    const entry = cache.links;
    
    if (!entry) {
        return null;
    }
    
    // Check if cache is still valid
    const now = Date.now();
    if (now > entry.expiresAt) {
        // Cache expired
        cache.links = null;
        return null;
    }
    
    return entry.data;
}

/**
 * Check if cached links are stale (but still valid)
 * Stale cache can be served while revalidating in background
 * @returns true if cache exists but is approaching expiration
 */
export function isCacheStale(): boolean {
    const entry = cache.links;
    
    if (!entry) {
        return false;
    }
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    // Consider cache stale if older than STALE_THRESHOLD of TTL
    return age > CACHE_TTL * STALE_THRESHOLD;
}

/**
 * Set cached links data
 * @param data - Links data to cache
 */
export function setCachedLinks(data: LinksResponse): void {
    const now = Date.now();
    cache.links = {
        data,
        timestamp: now,
        expiresAt: now + CACHE_TTL,
    };
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
    cache.links = null;
}

/**
 * Get cache statistics
 * @returns Cache status information
 */
export function getCacheStats() {
    const entry = cache.links;
    
    if (!entry) {
        return {
            hasCache: false,
            age: 0,
            expiresIn: 0,
            isStale: false,
        };
    }
    
    const now = Date.now();
    const age = now - entry.timestamp;
    const expiresIn = entry.expiresAt - now;
    
    return {
        hasCache: true,
        age: Math.floor(age / 1000), // in seconds
        expiresIn: Math.floor(expiresIn / 1000), // in seconds
        isStale: isCacheStale(),
    };
}
