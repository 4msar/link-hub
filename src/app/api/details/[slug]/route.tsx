import { getLinkBySlug } from "@/lib/api";

// Cache duration for this route
export const revalidate = 3600; // 1 hour

export async function GET(
    request: Request,
    { params }: RouteContext<"/api/details/[slug]">,
) {
    try {
        const { slug } = await params;

        const link = await getLinkBySlug(slug);

        return new Response(JSON.stringify(link), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": `public, max-age=${revalidate}`,
            },
        });
    } catch (error) {
        return new Response(error.message ?? "Something went wrong", {
            status: 500,
        });
    }
}
