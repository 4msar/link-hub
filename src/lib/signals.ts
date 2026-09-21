const ARTIFACT_ID = "01M0YHXS3AZRN9DSRQMFS52QPE";
const ARTIFACT_API_URL = `https://artifacts.msar.dev/api/artifact/${ARTIFACT_ID}`;
const ARTIFACT_BASE_URL = `https://artifacts.msar.dev/a/${ARTIFACT_ID}`;

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

const getMetaAttributeValue = (tag: string, attribute: string): string | undefined => {
    const quotedMatch = tag.match(
        new RegExp(`${attribute}\\s*=\\s*(['"])(.*?)\\1`, "i"),
    );

    if (quotedMatch?.[2]) {
        return quotedMatch[2];
    }

    const unquotedMatch = tag.match(
        new RegExp(`${attribute}\\s*=\\s*([^\\s"'=<>\\x60]+)`, "i"),
    );
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

const extractTitle = (html: string): string | undefined => {
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!match?.[1]) {
        return undefined;
    }

    return normalizeMetadataValue(match[1].replace(/<[^>]*>/g, ""));
};

const parseSignalFile = (value: unknown): SignalFile | null => {
    if (!isRecord(value)) {
        return null;
    }

    const name = value.name;
    const uploaded = value.uploaded;

    if (
        typeof name !== "string" ||
        !/^Inbox-Signal-.+\.html$/i.test(name) ||
        typeof uploaded !== "string" ||
        Number.isNaN(Date.parse(uploaded))
    ) {
        return null;
    }

    return { name, uploaded };
};

const parseArtifactResponse = (value: unknown): ParsedArtifactResponse => {
    if (
        !isRecord(value) ||
        value.id !== ARTIFACT_ID ||
        !Array.isArray(value.files)
    ) {
        throw new Error("Invalid artifact response");
    }

    const files = value.files
        .map(parseSignalFile)
        .filter((file): file is SignalFile => file !== null)
        .sort(
            (left, right) =>
                Date.parse(right.uploaded) - Date.parse(left.uploaded),
        );

    if (files.length === 0) {
        throw new Error("No inbox signals found");
    }

    return { id: ARTIFACT_ID, files };
};

export const getSignalFiles = async (): Promise<SignalFile[]> => {
    const response = await fetch(ARTIFACT_API_URL, {
        next: { revalidate: 86400 },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch signals: ${response.status}`);
    }

    const artifact = parseArtifactResponse(await response.json());
    return artifact.files;
};

export const getSignalUrl = (name: string): string =>
    `${ARTIFACT_BASE_URL}/${encodeURIComponent(name)}`;

export const getLatestSignalMetadata = async (): Promise<LatestSignalMetadata> => {
    const [latestFile] = await getSignalFiles();

    if (!latestFile) {
        throw new Error("No latest signal file found");
    }

    const response = await fetch(getSignalUrl(latestFile.name), {
        next: { revalidate: 86400 },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch latest signal file: ${response.status}`);
    }

    const html = await response.text();

    return {
        title: extractTitle(html),
        description: extractMetaContent(html, "name", "description"),
        openGraphTitle: extractMetaContent(html, "property", "og:title"),
        openGraphDescription: extractMetaContent(
            html,
            "property",
            "og:description",
        ),
        twitterTitle: extractMetaContent(html, "name", "twitter:title"),
        twitterDescription: extractMetaContent(
            html,
            "name",
            "twitter:description",
        ),
    };
};
