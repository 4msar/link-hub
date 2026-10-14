import { getSignal, getSignalFiles } from "@/lib/signals";
import { NextResponse } from "next/server";

// Cache duration for this route
export const revalidate = 86400; // 24 hours

type SignalFileRouteContext = {
    params: Promise<{ file: string }>;
};

const textError = (message: string, status: number) =>
    new NextResponse(message, {
        status,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

export async function GET(
    _request: Request,
    { params }: SignalFileRouteContext,
) {
    const { file } = await params;

    try {
        const signalFiles = await getSignalFiles();
        const signalFile = signalFiles.find(
            (signal) => signal.name.toLowerCase() === file.toLowerCase(),
        );

        if (!signalFile) {
            return textError("Signal file not found", 404);
        }

        const html = await getSignal(signalFile.name);

        return new NextResponse(html, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": `public, max-age=${revalidate}`,
            },
        });
    } catch (error) {
        console.error("Signal file fetch error:", error);
        return textError("Failed to load signal file", 500);
    }
}
