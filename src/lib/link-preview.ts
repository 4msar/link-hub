export type LinkPreviewData = {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    favicon?: string;
    siteName?: string;
};

const decodeEntities = (value: string) =>
    value
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
            String.fromCharCode(parseInt(code, 16))
        )
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&");

function attr(tag: string, name: string) {
    const match = tag.match(
        new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")
    );
    const value = match?.[1] ?? match?.[2] ?? match?.[3];
    return value === undefined ? undefined : decodeEntities(value).trim();
}

function absolute(value: string | undefined, base: URL) {
    if (!value) return undefined;
    try {
        const url = new URL(value, base);
        return url.protocol === "http:" || url.protocol === "https:"
            ? url.toString()
            : undefined;
    } catch {
        return undefined;
    }
}

// Pulls the preview fields out of a page's markup, first match wins. Regex instead of
// a DOM parser so the same code runs on the server (external links) and in the
// browser (internal ones). The whole document is scanned because Next.js can stream
// metadata into <body>.
export function parsePreview(head: string, pageUrl: URL): LinkPreviewData {
    const meta: Record<string, string> = {};
    let favicon: string | undefined;

    for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
        const key = (attr(tag, "property") ?? attr(tag, "name"))?.toLowerCase();
        const content = attr(tag, "content");
        if (key && content && !(key in meta)) meta[key] = content;
    }

    for (const [tag] of head.matchAll(/<link\b[^>]*>/gi)) {
        const rel = attr(tag, "rel")?.toLowerCase() ?? "";
        if (rel.split(/\s+/).includes("icon") || rel === "shortcut icon") {
            favicon ??= attr(tag, "href");
        }
    }

    const title = head.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];

    return {
        url: pageUrl.toString(),
        title: meta["og:title"] ?? meta["twitter:title"] ?? (title && decodeEntities(title).trim()),
        description:
            meta["og:description"] ?? meta["twitter:description"] ?? meta["description"],
        image: absolute(meta["og:image"] ?? meta["twitter:image"], pageUrl),
        favicon: absolute(favicon ?? "/favicon.ico", pageUrl),
        siteName: meta["og:site_name"],
    };
}
