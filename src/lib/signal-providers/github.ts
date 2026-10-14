import {
    GITHUB_TOKEN,
    SIGNAL_GITHUB_BRANCH,
    SIGNAL_GITHUB_REPO,
} from "@/lib/constant";
import {
    encodePath,
    isRecord,
    sortByUploadedDesc,
    type SignalFile,
    type SignalProvider,
} from "./types";

const GITHUB_API_URL = `https://api.github.com/repos/${SIGNAL_GITHUB_REPO}`;
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${SIGNAL_GITHUB_REPO}/${SIGNAL_GITHUB_BRANCH}`;
const FILE_NAME_DATE_PATTERN = /(\d{4}-\d{2}-\d{2})/;

const getRepo = (): string => {
    if (!/^[\w.-]+\/[\w.-]+$/.test(SIGNAL_GITHUB_REPO)) {
        throw new Error("Missing or invalid SIGNAL_GITHUB_REPO");
    }

    return SIGNAL_GITHUB_REPO;
};

const githubHeaders = (): HeadersInit => ({
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
});

const githubFetch = async (url: string): Promise<unknown> => {
    const response = await fetch(url, {
        headers: githubHeaders(),
    });

    if (!response.ok) {
        throw new Error(`GitHub request failed: ${response.status} ${url}`);
    }

    return response.json();
};

// GitHub's contents API has no timestamps, so the date comes from the file
// name (e.g. Inbox-Signal-2026-10-12.html), falling back to the last commit.
const getLastCommitDate = async (path: string): Promise<string | null> => {
    const commits = await githubFetch(
        `${GITHUB_API_URL}/commits?sha=${encodeURIComponent(SIGNAL_GITHUB_BRANCH)}&path=${encodeURIComponent(path)}&per_page=1`,
    );

    if (!Array.isArray(commits) || !isRecord(commits[0])) {
        return null;
    }

    const commit = commits[0].commit;
    const date =
        isRecord(commit) && isRecord(commit.committer)
            ? commit.committer.date
            : undefined;

    return typeof date === "string" && !Number.isNaN(Date.parse(date))
        ? date
        : null;
};

const toSignalFile = async (value: unknown): Promise<SignalFile | null> => {
    if (
        !isRecord(value) ||
        value.type !== "file" ||
        typeof value.name !== "string" ||
        typeof value.path !== "string"
    ) {
        return null;
    }

    const nameDate = value.name.match(FILE_NAME_DATE_PATTERN)?.[1];
    const uploaded =
        nameDate && !Number.isNaN(Date.parse(nameDate))
            ? new Date(`${nameDate}T00:00:00Z`).toISOString()
            : await getLastCommitDate(value.path);

    return uploaded ? { name: value.name, uploaded } : null;
};

export const githubProvider: SignalProvider = {
    name: "github",

    async listFiles(path) {
        getRepo();
        const contentsPath = path ? `/${encodePath(path)}` : "";
        const entries = await githubFetch(
            `${GITHUB_API_URL}/contents${contentsPath}?ref=${encodeURIComponent(SIGNAL_GITHUB_BRANCH)}`,
        );

        if (!Array.isArray(entries)) {
            throw new Error("Invalid GitHub contents response");
        }

        const files = await Promise.all(entries.map(toSignalFile));
        return sortByUploadedDesc(
            files.filter((file): file is SignalFile => file !== null),
        );
    },

    async getFile(path) {
        getRepo();

        const response = await fetch(`${GITHUB_RAW_URL}/${encodePath(path)}`, {
            headers: GITHUB_TOKEN
                ? { Authorization: `Bearer ${GITHUB_TOKEN}` }
                : undefined,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${path}: ${response.status}`);
        }

        return response.text();
    },

    // raw.githubusercontent.com serves HTML as text/plain, so browsers get
    // the file through our own route, which proxies it with an HTML type.
    getPublicUrl(name) {
        return `/signals/file/${encodeURIComponent(name)}`;
    },
};
