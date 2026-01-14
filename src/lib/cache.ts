/**
 * Cache utility for storing and managing API responses
 * Uses Redis for persistent caching with TTL-based validation
 */

import { createClient } from "redis";
import { LinksResponse } from "@/types/link";

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

// Cache configuration
const CACHE_TTL = 60 * 60; // 1 hour in seconds (Redis uses seconds)
const STALE_THRESHOLD = 0.83; // Consider cache stale after 83% of TTL

// Redis client singleton
let redisClient: ReturnType<typeof createClient> | null = null;
let isConnecting = false;

/**
 * Get or create Redis client connection
 */
async function getRedisClient() {
    if (redisClient?.isOpen) {
        return redisClient;
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
        // Wait for existing connection attempt
        await new Promise((resolve) => setTimeout(resolve, 100));
        return getRedisClient();
    }

    try {
        isConnecting = true;
        
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            throw new Error("REDIS_URL environment variable is not set");
        }

        redisClient = createClient({ url: redisUrl });
        
        redisClient.on("error", (err) => {
            console.error("[Redis] Connection error:", err);
        });

        await redisClient.connect();
        console.log("[Redis] Connected successfully");
        
        return redisClient;
    } catch (error) {
        console.error("[Redis] Failed to connect:", error);
        redisClient = null;
        throw error;
    } finally {
        isConnecting = false;
    }
}

/**
 * Get cached links data from Redis
 * @returns Cached links data or null if not found or expired
 */
export async function getCachedLinks(): Promise<LinksResponse | null> {
    try {
        const client = await getRedisClient();
        const cached = await client.get("links:cache");
        
        if (!cached) {
            return null;
        }
        
        const entry: CacheEntry<LinksResponse> = JSON.parse(String(cached));
        
        // Check if cache is still valid
        const now = Date.now();
        if (now > entry.expiresAt) {
            // Cache expired, delete it
            await client.del("links:cache");
            return null;
        }
        
        return entry.data;
    } catch (error) {
        console.error("[Redis] Error getting cached links:", error);
        return null;
    }
}

/**
 * Check if cached links are stale (but still valid)
 * Stale cache can be served while revalidating in background
 * @returns true if cache exists but is approaching expiration
 */
export async function isCacheStale(): Promise<boolean> {
    try {
        const client = await getRedisClient();
        const cached = await client.get("links:cache");
        
        if (!cached) {
            return false;
        }
        
        const entry: CacheEntry<LinksResponse> = JSON.parse(String(cached));
        const now = Date.now();
        const age = now - entry.timestamp;
        
        // Consider cache stale if older than STALE_THRESHOLD of TTL
        return age > CACHE_TTL * 1000 * STALE_THRESHOLD;
    } catch (error) {
        console.error("[Redis] Error checking cache staleness:", error);
        return false;
    }
}

/**
 * Set cached links data in Redis
 * @param data - Links data to cache
 */
export async function setCachedLinks(data: LinksResponse): Promise<void> {
    try {
        const client = await getRedisClient();
        const now = Date.now();
        
        const entry: CacheEntry<LinksResponse> = {
            data,
            timestamp: now,
            expiresAt: now + CACHE_TTL * 1000,
        };
        
        // Store in Redis with TTL
        await client.setEx("links:cache", CACHE_TTL, JSON.stringify(entry));
        console.log("[Redis] Cache updated successfully");
    } catch (error) {
        console.error("[Redis] Error setting cache:", error);
        throw error;
    }
}

/**
 * Clear all cached data from Redis
 */
export async function clearCache(): Promise<void> {
    try {
        const client = await getRedisClient();
        await client.del("links:cache");
        console.log("[Redis] Cache cleared successfully");
    } catch (error) {
        console.error("[Redis] Error clearing cache:", error);
        throw error;
    }
}

/**
 * Get cache statistics from Redis
 * @returns Cache status information
 */
export async function getCacheStats() {
    try {
        const client = await getRedisClient();
        const cached = await client.get("links:cache");
        
        if (!cached) {
            return {
                hasCache: false,
                age: 0,
                expiresIn: 0,
                isStale: false,
            };
        }
        
        const entry: CacheEntry<LinksResponse> = JSON.parse(String(cached));
        const now = Date.now();
        const age = now - entry.timestamp;
        const expiresIn = entry.expiresAt - now;
        
        return {
            hasCache: true,
            age: Math.floor(age / 1000), // in seconds
            expiresIn: Math.floor(expiresIn / 1000), // in seconds
            isStale: age > CACHE_TTL * 1000 * STALE_THRESHOLD,
        };
    } catch (error) {
        console.error("[Redis] Error getting cache stats:", error);
        return {
            hasCache: false,
            age: 0,
            expiresIn: 0,
            isStale: false,
        };
    }
}
