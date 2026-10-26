import { XMLParser } from "fast-xml-parser";
import { SyntaxValidator } from "fast-xml-validator";

export const extractRssToJson = (rss: string) => {
    const validation = SyntaxValidator.validate(rss);

    if (validation !== true) {
        throw new Error("Invalid RSS XML");
    }

    const parser = new XMLParser({
        ignoreAttributes: false,
        trimValues: true,
    });

    const xmlDoc = parser.parse(rss);

    const rawItems = xmlDoc?.rss?.channel?.item ?? [];

    const items = (Array.isArray(rawItems) ? rawItems : [rawItems])
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
            title: item.title ?? "",
            link: item.link ?? "",
            pubDate: item.pubDate ?? "",
            description: item.description ?? "",
        }));

    return { items };
};
