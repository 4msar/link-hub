import { getLinkBySlug } from "@/lib/api";

// Cache this route for 60 seconds
export const revalidate = 60;

export async function GET(
    request: Request,
    { params }: RouteContext<"/api/details/[slug]">
) {
    try {
        const { slug } = await params;

        const link = await getLinkBySlug(slug);

        return Response.json(link);
    } catch (error) {
        return new Response(error.message ?? "Something went wrong", {
            status: 500,
        });
    }
}
