import { VERY_LONG_CACHE_DURATION } from "@/lib/constant";
import { type NextRequest } from "next/server";

// Cache this route for 60 seconds
export const revalidate = VERY_LONG_CACHE_DURATION;

export async function GET(request: NextRequest) {
    return new Response(JSON.stringify({ message: "Hello, World!" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
