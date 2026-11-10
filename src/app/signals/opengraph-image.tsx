import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { getLatestSignalMetadata, getSignalFiles } from "@/lib/signals";
import { SIGNALS_TITLE } from "@/lib/site";

export const alt = SIGNALS_TITLE;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 86400;

const SIGNAL_DATE_PATTERN = /(\d{4}-\d{2}-\d{2})/;

const formatIssueDate = (fileName: string): string | undefined => {
    const date = fileName.match(SIGNAL_DATE_PATTERN)?.[1];
    if (!date) return undefined;

    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
};

export default async function Image() {
    let title = "Inbox Signal";
    let footer = "Weekly newsletter digest";

    try {
        const [files, latest] = await Promise.all([
            getSignalFiles(),
            getLatestSignalMetadata(),
        ]);
        title = latest.openGraphTitle ?? latest.title ?? title;
        const issueDate = formatIssueDate(files[0].name);
        if (issueDate) footer = `Latest issue · ${issueDate}`;
    } catch {
        // Fall back to the generic card when signals can't be loaded.
    }

    return renderOgImage({
        section: "signals",
        title,
        description:
            "A week of newsletters, distilled into one fact-checked page.",
        footer,
    });
}
