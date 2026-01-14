import { getLinks } from "@/lib/api";
import { getCachedLinks, setCachedLinks, isCacheStale } from "@/lib/cache";
import { type NextRequest } from "next/server";

// Background revalidation flag to prevent multiple simultaneous requests
let isRevalidating = false;

/**
 * Revalidate cache in the background
 * This function updates the cache without blocking the response
 */
async function revalidateCache(queryParams: Record<string, string | number>) {
    if (isRevalidating) {
        console.log("[Links API] Revalidation already in progress, skipping");
        return;
    }

    try {
        isRevalidating = true;
        console.log("[Links API] Starting background revalidation...");
        
        const freshData = await getLinks(queryParams);
        setCachedLinks(freshData);
        
        console.log("[Links API] Background revalidation completed");
    } catch (error) {
        console.error("[Links API] Background revalidation failed:", error);
    } finally {
        isRevalidating = false;
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const queryParams: Record<string, string | number> = Object.fromEntries(
            Array.from(searchParams.entries()).map(([key, value]) => [
                key,
                value,
            ])
        );

        // Check if request is for page 1 without search (cacheable request)
        const isCacheableRequest = 
            (!queryParams.page || queryParams.page === "1" || queryParams.page === 1) &&
            !queryParams.search;

        if (isCacheableRequest) {
            // Try to serve from cache
            const cachedData = getCachedLinks();
            
            if (cachedData) {
                console.log("[Links API] Serving from cache");
                
                // Check if cache is stale and trigger background revalidation
                if (isCacheStale()) {
                    console.log("[Links API] Cache is stale, triggering background revalidation");
                    // Don't await - let it run in background
                    revalidateCache(queryParams).catch(err => 
                        console.error("[Links API] Background revalidation error:", err)
                    );
                }
                
                return new Response(JSON.stringify(cachedData), {
                    status: 200,
                    headers: { 
                        "Content-Type": "application/json",
                        "X-Cache-Status": "HIT",
                    },
                });
            }
            
            console.log("[Links API] Cache miss, fetching from API");
            
            // Cache miss - fetch from API and cache the result
            const links = await getLinks(queryParams);
            setCachedLinks(links);
            
            return new Response(JSON.stringify(links), {
                status: 200,
                headers: { 
                    "Content-Type": "application/json",
                    "X-Cache-Status": "MISS",
                },
            });
        }

        // Non-cacheable request (pagination, search, etc.) - fetch directly
        console.log("[Links API] Non-cacheable request, fetching from API");
        const links = await getLinks(queryParams);

        return new Response(JSON.stringify(links), {
            status: 200,
            headers: { 
                "Content-Type": "application/json",
                "X-Cache-Status": "BYPASS",
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
