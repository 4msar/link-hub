import { type NextRequest } from "next/server";

const FETCH_TIMEOUT_MS = 5000;
const MAX_HTML_BYTES = 512 * 1024; // the <head> is all we need

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });

// This route is reachable from the public /submit page, so refuse anything
// that is not a plain public http(s) URL
const isAllowedUrl = (raw: string) => {
    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        return false;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (
        host === "localhost" ||
        host.endsWith(".localhost") ||
        host.endsWith(".local") ||
        host.endsWith(".internal") ||
        !host.includes(".") && !host.includes(":")
    ) {
        return false;
    }

    // IPv4 literals in private, loopback, link-local or reserved ranges
    const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
    if (ipv4) {
        const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
        if (
            a === 0 ||
            a === 10 ||
            a === 127 ||
            (a === 100 && b >= 64 && b <= 127) ||
            (a === 169 && b === 254) ||
            (a === 172 && b >= 16 && b <= 31) ||
            (a === 192 && b === 168) ||
            a >= 224
        ) {
            return false;
        }
    }

    // IPv6 literals: loopback, unique-local, link-local, IPv4-mapped
    if (host.includes(":")) {
        if (
            host === "::" ||
            host === "::1" ||
            /^f[cd]/.test(host) ||
            host.startsWith("fe80") ||
            host.startsWith("::ffff:")
        ) {
            return false;
        }
    }

    return true;
};

const readLimited = async (res: Response) => {
    if (!res.body) return "";
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    let received = 0;

    while (received < MAX_HTML_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        html += decoder.decode(value, { stream: true });
        if (/<\/head>/i.test(html)) break;
    }

    await reader.cancel().catch(() => {});
    return html;
};

const decodeEntities = (text: string) =>
    text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;|&apos;/g, "'")
        .trim();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
        return json({ error: "Missing url parameter" }, 400);
    }

    if (!isAllowedUrl(url)) {
        return json({ error: "URL not allowed" }, 400);
    }

    try {
        const res = await fetch(url, {
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            headers: { Accept: "text/html,application/xhtml+xml" },
        });

        // Redirects are followed, so check where we ended up as well
        if (!isAllowedUrl(res.url || url)) {
            return json({ error: "URL not allowed" }, 400);
        }

        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.includes("html")) {
            return json({ title: null, description: null });
        }

        const html = await readLimited(res);

        // Simple metadata extraction (title and description)
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const descriptionMatch = html.match(
            /<meta name="description" content="(.*?)"/i,
        );

        return json({
            title: titleMatch ? decodeEntities(titleMatch[1]) : null,
            description: descriptionMatch
                ? decodeEntities(descriptionMatch[1])
                : null,
        });
    } catch {
        return json({ error: "Failed to fetch metadata" }, 500);
    }
}
