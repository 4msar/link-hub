import { getLinks } from "@/lib/api";
import { type NextRequest } from "next/server";

// Cache this route for 60 seconds
export const revalidate = 60;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const queryParams: Record<string, string | number> = Object.fromEntries(
            Array.from(searchParams.entries()).map(([key, value]) => [
                key,
                value,
            ])
        );

        const links = await getLinks(queryParams);

        return new Response(JSON.stringify(links), {
            status: 200,
            headers: { "Content-Type": "application/json" },
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
