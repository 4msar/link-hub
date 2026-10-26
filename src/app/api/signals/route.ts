import { getSignalFiles, getSignalUrl } from "@/lib/signals";
import { NextResponse } from "next/server";

export const revalidate = 86400;

export async function GET() {
    try {
        const files = await getSignalFiles();
        const signals = files.map(({ name, uploaded }) => {
            const date = name.match(/(\d{4}-\d{2}-\d{2})/)?.[1];

            return {
                name,
                links: {
                    signal: getSignalUrl(name),
                    feed: date
                        ? `/signals/feed/rss-${date}.xml`
                        : "/signals/feed",
                },
                uploaded,
            };
        });

        return NextResponse.json(
            {
                name: "Inbox Signals",
                latest: signals[0] ?? null,
                signals,
            },
            {
                headers: { "Cache-Control": `public, max-age=${revalidate}` },
            },
        );
    } catch (error) {
        console.error("Signal files fetch error:", error);
        return NextResponse.json(
            { error: "Failed to load signal files" },
            { status: 500 },
        );
    }
}
