import { getLatestSignalFeed } from "@/lib/signals";
import { NextResponse } from "next/server";

// Cache duration for this route
export const revalidate = 86400; // 24 hours

export async function GET() {
    try {
        const feed = await getLatestSignalFeed();

        return new NextResponse(feed, {
            status: 200,
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": `public, max-age=${revalidate}`,
            },
        });
    } catch (error) {
        console.error("Signal feed fetch error:", error);
        return new NextResponse(
            '<?xml version="1.0" encoding="UTF-8" ?><error>Failed to load signal feed</error>',
            {
                status: 500,
                headers: { "Content-Type": "application/xml" },
            },
        );
    }
}
