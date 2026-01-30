import { getLinks } from "@/lib/api";
import { type NextRequest } from "next/server";

// Cache duration for this route
export const revalidate = 1800; // 30 minutes

export async function GET(request: NextRequest) {
    try {
        // Fetch links with pagination parameters
        const links = await getLinks({
            per_page: 50, // Fetch up to 50 recent links for the RSS feed
        });

        // Generate RSS XML
        const rssXml = generateRSS(links.data);

        return new Response(rssXml, {
            status: 200,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": `public, max-age=${revalidate}`,
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}

function generateRSS(links: Array<{
    id: string | number;
    name: string;
    slug: string;
    value: string;
    type: "text" | "url" | "link";
    created_at?: string;
    updated_at?: string;
}>): string {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pockets.msar.me";
    const buildDate = new Date().toUTCString();
    
    // Escape XML special characters
    const escapeXml = (str: string): string => {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    };

    const items = links
        .map((link) => {
            const title = escapeXml(link.name);
            const description = link.type === "url" || link.type === "link" 
                ? escapeXml(link.value)
                : escapeXml(link.name);
            const linkUrl = link.type === "url" || link.type === "link"
                ? escapeXml(link.value)
                : `${siteUrl}/${link.slug}`;
            const pubDate = link.created_at 
                ? new Date(link.created_at).toUTCString()
                : buildDate;
            const guid = `${siteUrl}/${link.slug}`;

            return `    <item>
      <title>${title}</title>
      <link>${linkUrl}</link>
      <description>${description}</description>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`;
        })
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>My Bookmarked Links</title>
    <link>${siteUrl}</link>
    <description>All of my bookmarked links in one place.</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}
