import {
    SIGNAL_ARTIFACT_ID,
} from "@/lib/constant";
import {
    encodePath,
    isRecord,
    sortByUploadedDesc,
    type SignalFile,
    type SignalProvider,
} from "./types";

const ARTIFACT_API_URL = `https://artifacts.msar.dev/api/artifact/${SIGNAL_ARTIFACT_ID}`;
const ARTIFACT_BASE_URL = `https://artifacts.msar.dev/a/${SIGNAL_ARTIFACT_ID}`;

const getSignalArtifactId = (): string => {
    if (!SIGNAL_ARTIFACT_ID) {
        throw new Error("Missing SIGNAL_ARTIFACT_ID");
    }

    return SIGNAL_ARTIFACT_ID;
};

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
): SignalFile[] => {
    if (
        !isRecord(value) ||
        value.id !== artifactId ||
        !Array.isArray(value.files)
    ) {
        throw new Error("Invalid artifact response");
    }

    return sortByUploadedDesc(
        value.files
            .map(parseArtifactFile)
            .filter((file): file is SignalFile => file !== null),
    );
};

export const artifactsProvider: SignalProvider = {
    name: "artifacts",

    async listFiles(path) {
        const artifactId = getSignalArtifactId();
        const url = path
            ? `${ARTIFACT_API_URL}?path=${encodeURIComponent(path)}`
            : ARTIFACT_API_URL;

        const response = await fetch(url, {
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch signals: ${response.status}`);
        }

        return parseArtifactResponse(await response.json(), artifactId);
    },

    async getFile(path) {
        getSignalArtifactId();

        const response = await fetch(`${ARTIFACT_BASE_URL}/${encodePath(path)}`, {
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${path}: ${response.status}`);
        }

        return response.text();
    },

    getPublicUrl(name) {
        getSignalArtifactId();
        return `${ARTIFACT_BASE_URL}/${encodeURIComponent(name)}`;
    },
};
