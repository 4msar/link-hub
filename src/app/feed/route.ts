import { getLinks } from "@/lib/api";
import { addRefToLink } from "@/lib/utils";
import { LinkItem } from "@/types/link";
import { NextResponse } from "next/server";

// Cache duration for this route
export const revalidate = 3600; // 1 hour

const SITE_URL = "https://pockets.msar.me";
const SITE_TITLE = "Pockets";
const SITE_DESCRIPTION = "A collection of curated links";

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function generateRssItem(link: LinkItem): string {
    const linkUrl =
        link.type === "url" || link.type === "link"
            ? link.value
            : `${SITE_URL}/${link.slug}`;

    const pubDate = link.created_at
        ? new Date(link.created_at).toUTCString()
        : new Date().toUTCString();

    return `
    <item>
      <title>${escapeXml(link.name)}</title>
      <link>${escapeXml(addRefToLink(linkUrl))}</link>
      <guid isPermaLink="false">${escapeXml(String(link.id))}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(link.value)}</description>
    </item>`;
}

function generateRssFeed(links: LinkItem[]): string {
    const items = links.map(generateRssItem).join("\n");

    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(SITE_URL)}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}

export async function GET() {
    try {
        // Fetch all links (you can adjust the per_page parameter as needed)
        const response = await getLinks({
            per_page: 100,
            include_timestamps: "true",
        });
        const links = response.data || [];

        const rssFeed = generateRssFeed(links);

        return new NextResponse(rssFeed, {
            status: 200,
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": `public, max-age=${revalidate}`,
            },
        });
    } catch (error) {
        console.error("RSS feed generation error:", error);
        return new NextResponse(
            '<?xml version="1.0" encoding="UTF-8" ?><error>Failed to generate RSS feed</error>',
            {
                status: 500,
                headers: { "Content-Type": "application/xml" },
            },
        );
    }
}
