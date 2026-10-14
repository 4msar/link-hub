import { getSignalFeed, getSignalFeedFiles } from "@/lib/signals";
import { NextResponse } from "next/server";

// Cache duration for this route
export const revalidate = 86400; // 24 hours

type SignalFeedFileRouteContext = {
    params: Promise<{ file: string }>;
};

const xmlError = (message: string, status: number) =>
    new NextResponse(
        `<?xml version="1.0" encoding="UTF-8" ?><error>${message}</error>`,
        {
            status,
            headers: { "Content-Type": "application/xml" },
        },
    );

export async function GET(
    _request: Request,
    { params }: SignalFeedFileRouteContext,
) {
    const { file } = await params;

    try {
        const feedFiles = await getSignalFeedFiles();
        const feedFile = feedFiles.find(
            (feed) => feed.fileName.toLowerCase() === file.toLowerCase(),
        );

        if (!feedFile) {
            return xmlError("Signal feed not found", 404);
        }

        const feed = await getSignalFeed(feedFile.fileName);

        return new NextResponse(feed, {
            status: 200,
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": `public, max-age=${revalidate}`,
            },
        });
    } catch (error) {
        console.error("Signal feed file fetch error:", error);
        return xmlError("Failed to load signal feed", 500);
    }
}
