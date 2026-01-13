import { getLinkBySlug } from "@/lib/api";

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
