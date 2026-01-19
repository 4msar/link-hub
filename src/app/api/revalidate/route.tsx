import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest } from "next/server";

type RevalidateType = "page" | "layout" | undefined;

export async function GET(request: NextRequest) {
    try {
        const path = request.nextUrl.searchParams.get("path");
        const tag = request.nextUrl.searchParams.get("tag");
        const type = (request.nextUrl.searchParams.get("type") ||
            undefined) as RevalidateType;

        if (!path) {
            return new Response(
                JSON.stringify({
                    revalidated: false,
                    now: Date.now(),
                    message: "Missing path parameter",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        // Revalidate the specified path
        revalidatePath(path, type);

        revalidateTag(tag ?? path, "max");

        return new Response(
            JSON.stringify({
                revalidated: true,
                path,
                now: Date.now(),
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                revalidated: false,
                now: Date.now(),
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal server error",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
