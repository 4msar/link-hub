import { CACHE_TAGS } from "@/lib/constant";
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest } from "next/server";

type RevalidateType = "page" | "layout" | undefined;

export async function GET(request: NextRequest) {
    try {
        const path = request.nextUrl.searchParams.get("path");
        const tag = request.nextUrl.searchParams.get("tag");
        const type = (request.nextUrl.searchParams.get("type") ||
            undefined) as RevalidateType;
        const all = request.nextUrl.searchParams.get("all") === "true";

        // Clear every cache in the app: all tagged data (links, signals)
        // expires now instead of serving stale while refetching, and every
        // route under the root layout is revalidated.
        if (all) {
            const tags = Object.values(CACHE_TAGS);

            for (const cacheTag of tags) {
                revalidateTag(cacheTag, { expire: 0 });
            }
            revalidatePath("/", "layout");

            return new Response(
                JSON.stringify({
                    revalidated: true,
                    tags,
                    now: Date.now(),
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        if (!path) {
            return new Response(
                JSON.stringify({
                    revalidated: false,
                    now: Date.now(),
                    message: "Missing path parameter (or pass all=true)",
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
