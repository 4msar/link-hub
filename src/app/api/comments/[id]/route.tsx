import { getComments } from "@/lib/api";

// Cache duration for this route
export const revalidate = 300; // 5 minutes

export async function GET(
    request: Request,
    { params }: RouteContext<"/api/comments/[id]">,
) {
    try {
        const { id } = await params;

        const link = await getComments(id);

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
