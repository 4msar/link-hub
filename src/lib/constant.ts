export const BASE_API_URL =
    process.env.BASE_API_URL || "https://pockets-api.msar.me/api/v1";
export const apiKey = process.env.API_KEY || "";
export const projectID = process.env.PROJECT_ID || "pockets";
export const ADMIN_PIN = process.env.ADMIN_PIN || "";
export const SIGNAL_ARTIFACT_ID = process.env.SIGNAL_ARTIFACT_ID || "";

// Signals source: "github" or "artifacts"
export const SIGNAL_PROVIDER = (
    process.env.SIGNAL_PROVIDER || "github"
).toLowerCase();
export const SIGNAL_GITHUB_REPO =
    process.env.SIGNAL_GITHUB_REPO || "4msar/inbox-signals";
export const SIGNAL_GITHUB_BRANCH = process.env.SIGNAL_GITHUB_BRANCH || "main";
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

// Data cache tags, cleared together by /api/admin/cache
export const CACHE_TAGS = {
    links: "links",
    signals: "signals",
} as const;
export const SIGNAL_CACHE_TTL = 86400; // 1 day
