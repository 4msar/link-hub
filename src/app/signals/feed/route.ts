import { getLatestSignalFeed } from "@/lib/signals";
import { extractRssToJson } from "@/lib/xml";
import { NextResponse } from "next/server";

// Cache duration for this route
export const revalidate = 86400; // 24 hours

export async function GET(request: Request) {
    const wantsJson = new URL(request.url).searchParams.get("json") === "true";

    try {
        const feed = await getLatestSignalFeed();

        if (wantsJson) {
            return NextResponse.json(extractRssToJson(feed));
        }

        return new NextResponse(feed, {
            status: 200,
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": `public, max-age=${revalidate}`,
            },
        });
    } catch (error) {
        console.error("Signal feed fetch error:", error);

        if (wantsJson) {
            return NextResponse.json(
                { error: "Failed to load signal feed" },
                { status: 500 },
            );
        }

        return new NextResponse(
            '<?xml version="1.0" encoding="UTF-8" ?><error>Failed to load signal feed</error>',
            {
                status: 500,
                headers: { "Content-Type": "application/xml" },
            },
        );
    }
}
