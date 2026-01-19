import { getLinkBySlug } from "@/lib/api";
import { VERY_LONG_CACHE_DURATION } from "@/lib/constant";

// Cache duration for this route
export const revalidate = VERY_LONG_CACHE_DURATION;

export async function GET(
    request: Request,
    { params }: RouteContext<"/api/details/[slug]">
) {
    try {
        const { slug } = await params;

        const link = await getLinkBySlug(slug);

        return new Response(JSON.stringify(link), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": `public, max-age=${VERY_LONG_CACHE_DURATION}`,
            },
        });
    } catch (error) {
        return new Response(error.message ?? "Something went wrong", {
            status: 500,
        });
    }
}
