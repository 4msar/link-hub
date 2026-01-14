import { getLinks } from "@/lib/api";
import { setCachedLinks, getCacheStats } from "@/lib/cache";
import { type NextRequest } from "next/server";

// Configuration
const DEFAULT_CACHE_PAGE_SIZE = 100;

/**
 * Cache refresh endpoint
 * This endpoint should be called by a cron job every hour to refresh the cache
 * 
 * Usage:
 * - Call via cron job: GET /api/cache/refresh
 * - Can be triggered manually or via Vercel Cron, GitHub Actions, etc.
 */
export async function GET(request: NextRequest) {
    try {
        // Optional: Add authentication/authorization here
        // const authHeader = request.headers.get("authorization");
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return new Response(JSON.stringify({ error: "Unauthorized" }), {
        //         status: 401,
        //         headers: { "Content-Type": "application/json" },
        //     });
        // }

        console.log("[Cache Refresh] Starting cache refresh...");
        
        // Get cache stats before refresh
        const statsBefore = getCacheStats();
        
        // Fetch fresh data from the third-party API
        // Fetch first page with reasonable per_page to cache a good amount of data
        const freshData = await getLinks({ page: 1, per_page: DEFAULT_CACHE_PAGE_SIZE });
        
        // Update the cache
        setCachedLinks(freshData);
        
        // Get cache stats after refresh
        const statsAfter = getCacheStats();
        
        console.log("[Cache Refresh] Cache refreshed successfully");
        
        return new Response(
            JSON.stringify({
                success: true,
                message: "Cache refreshed successfully",
                timestamp: new Date().toISOString(),
                stats: {
                    before: statsBefore,
                    after: statsAfter,
                },
                itemsCount: freshData.data.length,
            }),
            {
                status: 200,
                headers: { 
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store, max-age=0",
                },
            }
        );
    } catch (error) {
        console.error("[Cache Refresh] Error refreshing cache:", error);
        
        return new Response(
            JSON.stringify({
                success: false,
                error: (error as Error).message,
                timestamp: new Date().toISOString(),
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

/**
 * POST endpoint for manual cache refresh with parameters
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { page = 1, per_page = DEFAULT_CACHE_PAGE_SIZE } = body;
        
        console.log(`[Cache Refresh] Starting cache refresh with params: page=${page}, per_page=${per_page}`);
        
        // Fetch fresh data from the third-party API with custom parameters
        const freshData = await getLinks({ page, per_page });
        
        // Update the cache
        setCachedLinks(freshData);
        
        const stats = getCacheStats();
        
        console.log("[Cache Refresh] Cache refreshed successfully");
        
        return new Response(
            JSON.stringify({
                success: true,
                message: "Cache refreshed successfully",
                timestamp: new Date().toISOString(),
                stats,
                itemsCount: freshData.data.length,
            }),
            {
                status: 200,
                headers: { 
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store, max-age=0",
                },
            }
        );
    } catch (error) {
        console.error("[Cache Refresh] Error refreshing cache:", error);
        
        return new Response(
            JSON.stringify({
                success: false,
                error: (error as Error).message,
                timestamp: new Date().toISOString(),
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
