import { getComments } from "@/lib/api";

// Cache this route for 30 seconds
export const revalidate = 30;

export async function GET(
    request: Request,
    { params }: RouteContext<"/api/comments/[id]">
) {
    try {
        const { id } = await params;

        const link = await getComments(id);

        return Response.json(link);
    } catch (error) {
        return new Response(error.message ?? "Something went wrong", {
            status: 500,
        });
    }
}
