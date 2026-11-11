import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { parsePreview, type LinkPreviewData } from "@/lib/link-preview";

const TIMEOUT_MS = 5000;
const MAX_BYTES = 512 * 1024;
const MAX_REDIRECTS = 3;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_LIMIT = 500;

const cache = new Map<string, { data: LinkPreviewData; expires: number }>();

function isPrivateAddress(address: string) {
    if (isIP(address) === 6) {
        const ip = address.toLowerCase();
        if (ip.startsWith("::ffff:")) return isPrivateAddress(ip.slice(7));
        return (
            ip === "::" ||
            ip === "::1" ||
            ip.startsWith("fc") ||
            ip.startsWith("fd") ||
            ip.startsWith("fe80")
        );
    }

    const [a, b] = address.split(".").map(Number);
    return (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        a >= 224
    );
}

// Only public http(s) hosts on default ports, so this route can't be used to reach
// anything on the server's own network.
async function assertPublic(url: URL) {
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Unsupported protocol");
    }
    if (url.port && url.port !== "80" && url.port !== "443") {
        throw new Error("Unsupported port");
    }
    if (url.username || url.password) throw new Error("Credentials in URL");

    const host = url.hostname.replace(/^\[|\]$/g, "");
    const addresses = isIP(host)
        ? [{ address: host }]
        : await lookup(host, { all: true });

    if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
        throw new Error("Private address");
    }
}

async function readHead(response: Response) {
    const reader = response.body?.getReader();
    if (!reader) return "";

    const decoder = new TextDecoder();
    let html = "";
    let bytes = 0;

    while (bytes < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        html += decoder.decode(value, { stream: true });
        if (/<\/head>/i.test(html)) break;
    }

    reader.cancel().catch(() => {});
    return html;
}

async function fetchPreview(target: URL) {
    const signal = AbortSignal.timeout(TIMEOUT_MS);
    let url = target;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
        await assertPublic(url);

        const response = await fetch(url, {
            signal,
            redirect: "manual",
            headers: {
                accept: "text/html,application/xhtml+xml",
                "accept-language": "en-US,en;q=0.9",
                "user-agent": "Mozilla/5.0 (compatible; msar.me link preview)",
            },
        });

        const location = response.headers.get("location");
        if (response.status >= 300 && response.status < 400 && location) {
            url = new URL(location, url);
            continue;
        }

        if (!response.ok) throw new Error(`Upstream ${response.status}`);
        if (!response.headers.get("content-type")?.includes("html")) {
            response.body?.cancel().catch(() => {});
            return { url: url.toString() };
        }

        return parsePreview(await readHead(response), url);
    }

    throw new Error("Too many redirects");
}

export async function GET(request: NextRequest) {
    let target: URL;
    try {
        target = new URL(request.nextUrl.searchParams.get("url") ?? "");
    } catch {
        return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }
    target.hash = "";

    const key = target.toString();
    const hit = cache.get(key);
    let data = hit && hit.expires > Date.now() ? hit.data : undefined;

    if (!data) {
        try {
            data = await fetchPreview(target);
        } catch {
            return NextResponse.json({ error: "Preview unavailable" }, { status: 422 });
        }

        if (cache.size >= CACHE_LIMIT) {
            cache.delete(cache.keys().next().value!);
        }
        cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
    }

    return NextResponse.json(data, {
        headers: {
            "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        },
    });
}
