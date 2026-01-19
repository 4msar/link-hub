export const BASE_API_URL = "https://silo.msar.dev/api";
export const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";
export const projectID = process.env.NEXT_PUBLIC_PROJECT_ID || "pockets";
export const commentsProjectID =
    process.env.NEXT_PUBLIC_PROJECT_DISCUSSION_ID || "pockets-discussion";

// Cache durations in seconds
export const SHORT_CACHE_DURATION = 60; // 1 minute
export const MEDIUM_CACHE_DURATION = 300; // 5 minutes
export const LONG_CACHE_DURATION = 3600; // 1 hour
export const VERY_LONG_CACHE_DURATION = 86400; // 24 hours
