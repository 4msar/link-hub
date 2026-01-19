import { getComments } from "@/lib/api";
import { MEDIUM_CACHE_DURATION } from "@/lib/constant";

// Cache duration for this route
export const revalidate = MEDIUM_CACHE_DURATION;

export async function GET(
    request: Request,
    { params }: RouteContext<"/api/comments/[id]">
) {
    try {
        const { id } = await params;

        const link = await getComments(id);

        return new Response(JSON.stringify(link), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": `public, max-age=${MEDIUM_CACHE_DURATION}`,
            },
        });
    } catch (error) {
        return new Response(error.message ?? "Something went wrong", {
            status: 500,
        });
    }
}
