const ARTIFACT_ID = "01M0YHXS3AZRN9DSRQMFS52QPE";
const ARTIFACT_API_URL = `https://artifacts.msar.dev/api/artifact/${ARTIFACT_ID}`;
const ARTIFACT_BASE_URL = `https://artifacts.msar.dev/a/${ARTIFACT_ID}`;

export type SignalFile = {
    name: string;
    uploaded: string;
};

type ParsedArtifactResponse = {
    id: string;
    files: SignalFile[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

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
