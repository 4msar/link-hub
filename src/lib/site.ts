/** Site-wide SEO constants, shared by metadata, the sitemap and OG images. */
export const SITE_URL = "https://pockets.msar.me";
export const SITE_NAME = "Pockets";
export const SITE_TITLE = "Pockets — Things I Saved";
export const SITE_DESCRIPTION =
    "A curated collection of links, articles and tools worth keeping, saved for later by Saiful Alam.";
export const SITE_AUTHOR = { name: "Saiful Alam", url: "https://msar.me" };
export const TWITTER_HANDLE = "@4msar";

export const SIGNALS_TITLE = "Signals — Weekly Inbox Digest";
export const SIGNALS_DESCRIPTION =
    "Inbox Signal turns a week of engineering and AI newsletters into one fact-checked page. Browse the latest issue and the archive.";

export const truncate = (value: string, max: number): string => {
    const text = value.replace(/\s+/g, " ").trim();
    return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
};
