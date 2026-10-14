import { getSignalProvider, type SignalFile } from "@/lib/signal-providers";

export type { SignalFile };

export type LatestSignalMetadata = {
    title?: string;
    description?: string;
    openGraphTitle?: string;
    openGraphDescription?: string;
    twitterTitle?: string;
    twitterDescription?: string;
};

const normalizeMetadataValue = (value: string): string | undefined => {
    const normalized = value.replace(/\s+/g, " ").trim();
    return normalized.length > 0 ? normalized : undefined;
};

const ATTRIBUTE_QUOTED_PATTERNS = {
    name: /name\s*=\s*(['"])(.*?)\1/i,
    property: /property\s*=\s*(['"])(.*?)\1/i,
    content: /content\s*=\s*(['"])(.*?)\1/i,
} as const;

const ATTRIBUTE_UNQUOTED_PATTERNS = {
    name: /name\s*=\s*([^\s"'=<>`]+)/i,
    property: /property\s*=\s*([^\s"'=<>`]+)/i,
    content: /content\s*=\s*([^\s"'=<>`]+)/i,
} as const;

const getMetaAttributeValue = (
    tag: string,
    attribute: keyof typeof ATTRIBUTE_QUOTED_PATTERNS,
): string | undefined => {
    const quotedMatch = tag.match(ATTRIBUTE_QUOTED_PATTERNS[attribute]);

    if (quotedMatch?.[2]) {
        return quotedMatch[2];
    }

    const unquotedMatch = tag.match(ATTRIBUTE_UNQUOTED_PATTERNS[attribute]);
    return unquotedMatch?.[1];
};

const extractMetaContent = (
    html: string,
    attribute: "name" | "property",
    value: string,
): string | undefined => {
    for (const metaTag of html.matchAll(/<meta\s+[^>]*>/gi)) {
        const tag = metaTag[0];
        const attributeValue = getMetaAttributeValue(tag, attribute);

        if (attributeValue?.toLowerCase() !== value.toLowerCase()) {
            continue;
        }

        const contentValue = getMetaAttributeValue(tag, "content");
        if (typeof contentValue === "string") {
            return normalizeMetadataValue(contentValue);
        }
    }

    return undefined;
};

const SIGNAL_FILE_PATTERN = /^Inbox-Signal-.+\.html$/i;
const SIGNAL_FEED_DIRECTORY = "feed";
const SIGNAL_FEED_FILE_PATTERN = /^rss-(\d{4}-\d{2}-\d{2})\.xml$/i;

export const getSignalFiles = async (): Promise<SignalFile[]> => {
    const files = (await getSignalProvider().listFiles()).filter((file) =>
        SIGNAL_FILE_PATTERN.test(file.name),
    );

    if (files.length === 0) {
        throw new Error("No inbox signals found");
    }

    return files;
};

export type SignalFeedFile = {
    fileName: string;
    date: string;
};

export const getSignalFeedFiles = async (): Promise<SignalFeedFile[]> =>
    (await getSignalProvider().listFiles(SIGNAL_FEED_DIRECTORY))
        .map((file) => file.name.match(SIGNAL_FEED_FILE_PATTERN))
        .filter((match): match is RegExpMatchArray => match !== null)
        .map(([fileName, date]) => ({ fileName, date }))
        .sort((left, right) => right.date.localeCompare(left.date));

export const isSignalFeedFileName = (fileName: string): boolean =>
    SIGNAL_FEED_FILE_PATTERN.test(fileName);

export const getSignalFeed = async (fileName: string): Promise<string> => {
    if (!isSignalFeedFileName(fileName)) {
        throw new Error(`Invalid signal feed file name: ${fileName}`);
    }

    return getSignalProvider().getFile(`${SIGNAL_FEED_DIRECTORY}/${fileName}`);
};

export const getLatestSignalFeed = async (): Promise<string> => {
    const [latestFeed] = await getSignalFeedFiles();

    if (!latestFeed) {
        throw new Error("No signal feed found");
    }

    return getSignalFeed(latestFeed.fileName);
};

export const getSignalUrl = (name: string): string =>
    getSignalProvider().getPublicUrl(name);

export const getSignal = async (name: string): Promise<string> => {
    if (!SIGNAL_FILE_PATTERN.test(name)) {
        throw new Error(`Invalid signal file name: ${name}`);
    }

    return getSignalProvider().getFile(name);
};

export const getLatestSignalMetadata =
    async (): Promise<LatestSignalMetadata> => {
        const [latestFile] = await getSignalFiles();

        if (!latestFile) {
            throw new Error("No latest signal file found");
        }

        const html = await getSignal(latestFile.name);
        const openGraphTitle = extractMetaContent(html, "property", "og:title");
        const twitterTitle = extractMetaContent(html, "name", "twitter:title");
        const openGraphDescription = extractMetaContent(
            html,
            "property",
            "og:description",
        );
        const twitterDescription = extractMetaContent(
            html,
            "name",
            "twitter:description",
        );
        const description = extractMetaContent(html, "name", "description");

        return {
            title: openGraphTitle ?? twitterTitle,
            description,
            openGraphTitle,
            openGraphDescription,
            twitterTitle,
            twitterDescription,
        };
    };
