import { getLinks } from "@/lib/api";
import { getSignalFiles } from "@/lib/signals";
import { LinkItem } from "@/types/link";
import type { MetadataRoute } from "next";

// Cache duration for this route
export const revalidate = 3600; // 1 hour

const SITE_URL = "https://pockets.msar.me";
const LINKS_PER_PAGE = 100;

const getAllLinks = async (): Promise<LinkItem[]> => {
    const links: LinkItem[] = [];
    let page = 1;
    let lastPage = 1;

    do {
        const response = await getLinks({
            page,
            per_page: LINKS_PER_PAGE,
            include_timestamps: "true",
        });
        links.push(...(response.data || []));
        lastPage = response.meta?.last_page ?? page;
        page++;
    } while (page <= lastPage);

    return links;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL, changeFrequency: "daily", priority: 1 },
        {
            url: `${SITE_URL}/signals`,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        { url: `${SITE_URL}/feed`, changeFrequency: "daily", priority: 0.5 },
        {
            url: `${SITE_URL}/signals/feed`,
            changeFrequency: "weekly",
            priority: 0.5,
        },
    ];

    const [links, signalFiles] = await Promise.all([
        getAllLinks().catch((error) => {
            console.error("Sitemap links fetch error:", error);
            return [];
        }),
        getSignalFiles().catch((error) => {
            console.error("Sitemap signals fetch error:", error);
            return [];
        }),
    ]);

    const linkRoutes: MetadataRoute.Sitemap = links.map((link) => ({
        url: `${SITE_URL}/${encodeURIComponent(link.slug)}`,
        lastModified: link.created_at ? new Date(link.created_at) : undefined,
        changeFrequency: "monthly" as const,
        priority: 0.6,
    }));

    const signalRoutes: MetadataRoute.Sitemap = signalFiles.map((file) => ({
        url: `${SITE_URL}/signals/file/${encodeURIComponent(file.name)}`,
        lastModified: new Date(file.uploaded),
        changeFrequency: "yearly" as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...signalRoutes, ...linkRoutes];
}
