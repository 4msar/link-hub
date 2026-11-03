import { NextRequest, NextResponse } from "next/server";
import { submitLink } from "@/lib/api";

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PER_WINDOW = 5;

// Best-effort per-instance limiter; the backend also caps the pending queue.
const hits = new Map<string, number[]>();

const isRateLimited = (ip: string) => {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_PER_WINDOW) {
        hits.set(ip, recent);
        return true;
    }
    recent.push(now);
    hits.set(ip, recent);
    return false;
};

const getClientIp = (request: NextRequest) =>
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

export async function POST(request: NextRequest) {
    if (isRateLimited(getClientIp(request))) {
        return NextResponse.json(
            { error: "Too many submissions, please try again later" },
            { status: 429 },
        );
    }

    let title = "";
    let link = "";
    try {
        const body = await request.json();
        title = String(body.title ?? "").trim();
        link = String(body.link ?? "").trim();
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!title || !link) {
        return NextResponse.json(
            { error: "Title and link are required" },
            { status: 400 },
        );
    }

    try {
        const url = new URL(link);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            throw new Error();
        }
    } catch {
        return NextResponse.json(
            { error: "Please enter a valid http(s) URL" },
            { status: 400 },
        );
    }

    try {
        const result = await submitLink({ title: title.slice(0, 200), link });
        if (!result.ok) {
            return NextResponse.json(
                { error: result.data.error || "Failed to submit link" },
                { status: result.status },
            );
        }
        return NextResponse.json({ success: true }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Failed to submit link" },
            { status: 500 },
        );
    }
}
