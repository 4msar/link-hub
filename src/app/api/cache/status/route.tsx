import { getCacheStats } from "@/lib/cache";
import { type NextRequest } from "next/server";

/**
 * Cache status endpoint
 * Returns information about the current cache state
 * 
 * Usage:
 * - GET /api/cache/status
 */
export async function GET(request: NextRequest) {
    try {
        const stats = getCacheStats();
        
        return new Response(
            JSON.stringify({
                success: true,
                timestamp: new Date().toISOString(),
                cache: stats,
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
