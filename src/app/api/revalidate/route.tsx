import { revalidatePath } from "next/cache";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { path, type } = body;

        if (!path) {
            return new Response(
                JSON.stringify({ error: "Missing path parameter" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Validate type parameter if provided
        if (type && type !== "page" && type !== "layout") {
            return new Response(
                JSON.stringify({
                    error: "Invalid type parameter. Must be 'page' or 'layout'",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Revalidate the specified path
        revalidatePath(path, type);

        return new Response(
            JSON.stringify({
                revalidated: true,
                path,
                now: Date.now(),
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                error:
                    error instanceof Error
                        ? error.message
                        : "Internal server error",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
