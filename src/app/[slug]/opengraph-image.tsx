import { getLinkBySlug } from "@/lib/api";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Saved link on Pockets";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const getHost = (link: string): string | undefined => {
    try {
        return new URL(link).hostname.replace(/^www\./, "");
    } catch {
        return undefined;
    }
};

export default async function Image({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    let title = "Saved link";
    let footer: string | undefined;

    try {
        const { slug } = await params;
        const data = await getLinkBySlug(slug);
        if (data?.item) {
            title = data.item.title;
            footer = getHost(data.item.link);
        }
    } catch {
        // Fall back to the generic card when the link can't be loaded.
    }

    return renderOgImage({ section: "saved", title, footer });
}
