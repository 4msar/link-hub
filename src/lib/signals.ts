import { SIGNAL_ARTIFACT_ID } from "@/lib/constant";

const ARTIFACT_API_URL = `https://artifacts.msar.dev/api/artifact/${SIGNAL_ARTIFACT_ID}`;
const ARTIFACT_BASE_URL = `https://artifacts.msar.dev/a/${SIGNAL_ARTIFACT_ID}`;

const getSignalArtifactId = (): string => {
    if (!SIGNAL_ARTIFACT_ID) {
        throw new Error("Missing SIGNAL_ARTIFACT_ID");
    }

    return SIGNAL_ARTIFACT_ID;
};

export type SignalFile = {
    name: string;
    uploaded: string;
};

export type LatestSignalMetadata = {
    title?: string;
    description?: string;
    openGraphTitle?: string;
    openGraphDescription?: string;
    twitterTitle?: string;
    twitterDescription?: string;
};

type ParsedArtifactResponse = {
    id: string;
    files: SignalFile[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

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

const parseArtifactFile = (value: unknown): SignalFile | null => {
    if (!isRecord(value)) {
        return null;
    }

    const name = value.name;
    const uploaded = value.uploaded;

    if (
        typeof name !== "string" ||
        typeof uploaded !== "string" ||
        Number.isNaN(Date.parse(uploaded))
    ) {
        return null;
    }

    return { name, uploaded };
};

const parseArtifactResponse = (
    value: unknown,
    artifactId: string,
): ParsedArtifactResponse => {
    if (
        !isRecord(value) ||
        value.id !== artifactId ||
        !Array.isArray(value.files)
    ) {
        throw new Error("Invalid artifact response");
    }

    const files = value.files
        .map(parseArtifactFile)
        .filter((file): file is SignalFile => file !== null)
        .sort(
            (left, right) =>
                Date.parse(right.uploaded) - Date.parse(left.uploaded),
        );

    return { id: artifactId, files };
};

const getArtifactFiles = async (path?: string): Promise<SignalFile[]> => {
    const artifactId = getSignalArtifactId();
    const url = path
        ? `${ARTIFACT_API_URL}?path=${encodeURIComponent(path)}`
        : ARTIFACT_API_URL;

    const response = await fetch(url, {
        next: { revalidate: 86400 },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch signals: ${response.status}`);
    }

    const artifact = parseArtifactResponse(await response.json(), artifactId);
    return artifact.files;
};

export const getSignalFiles = async (): Promise<SignalFile[]> => {
    const files = (await getArtifactFiles()).filter((file) =>
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
    (await getArtifactFiles(SIGNAL_FEED_DIRECTORY))
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

    const response = await fetch(
        `${ARTIFACT_BASE_URL}/${SIGNAL_FEED_DIRECTORY}/${encodeURIComponent(fileName)}`,
        { next: { revalidate: 86400 } },
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch signal feed: ${response.status}`);
    }

    return response.text();
};

export const getLatestSignalFeed = async (): Promise<string> => {
    const [latestFeed] = await getSignalFeedFiles();

    if (!latestFeed) {
        throw new Error("No signal feed found");
    }

    return getSignalFeed(latestFeed.fileName);
};

export const getSignalUrl = (name: string): string => {
    getSignalArtifactId();
    return `${ARTIFACT_BASE_URL}/${encodeURIComponent(name)}`;
};

export const getLatestSignalMetadata =
    async (): Promise<LatestSignalMetadata> => {
        const [latestFile] = await getSignalFiles();

        if (!latestFile) {
            throw new Error("No latest signal file found");
        }

        const response = await fetch(getSignalUrl(latestFile.name), {
            next: { revalidate: 86400 },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch latest signal file: ${response.status}`,
            );
        }

        const html = await response.text();
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
