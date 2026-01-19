import { getLinks } from "@/lib/api";
import { VERY_LONG_CACHE_DURATION } from "@/lib/constant";
import { type NextRequest } from "next/server";

// Cache duration for this route
export const revalidate = 86400;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const queryParams: Record<string, string | number> = Object.fromEntries(
            Array.from(searchParams.entries()).map(([key, value]) => [
                key,
                value,
            ]),
        );

        const links = await getLinks(queryParams);

        return new Response(JSON.stringify(links), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": `public, max-age=${VERY_LONG_CACHE_DURATION}`,
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
