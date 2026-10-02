import { SignalFileMenu } from "@/components/SignalFileMenu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    getLatestSignalMetadata,
    getSignalFiles,
    getSignalUrl,
} from "@/lib/signals";
import { Info } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 86400;

const fallbackSignalsMetadata: Metadata = {
    title: "Signals",
    description: "View the latest signal artifact files.",
    openGraph: {
        title: "Signals",
        description: "View the latest signal artifact files.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Signals",
        description: "View the latest signal artifact files.",
    },
};

type SignalsPageProps = {
    searchParams: Promise<{ file?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
    try {
        const latestMetadata = await getLatestSignalMetadata();

        const title =
            latestMetadata.title ??
            latestMetadata.openGraphTitle ??
            fallbackSignalsMetadata.title;
        const description =
            latestMetadata.description ??
            latestMetadata.openGraphDescription ??
            fallbackSignalsMetadata.description;

        return {
            ...fallbackSignalsMetadata,
            title,
            description,
            openGraph: {
                ...fallbackSignalsMetadata.openGraph,
                title: latestMetadata.openGraphTitle ?? title,
                description: latestMetadata.openGraphDescription ?? description,
            },
            twitter: {
                ...fallbackSignalsMetadata.twitter,
                title:
                    latestMetadata.twitterTitle ??
                    latestMetadata.openGraphTitle ??
                    title,
                description:
                    latestMetadata.twitterDescription ??
                    latestMetadata.openGraphDescription ??
                    description,
            },
        };
    } catch {
        return fallbackSignalsMetadata;
    }
}

export default async function SignalsPage({ searchParams }: SignalsPageProps) {
    let files: Awaited<ReturnType<typeof getSignalFiles>>;
    let params: Awaited<typeof searchParams>;

    try {
        [files, params] = await Promise.all([getSignalFiles(), searchParams]);
    } catch {
        return (
            <main className="flex h-screen items-center justify-center bg-background px-6 text-center text-foreground">
                <p role="alert">Unable to load this signal artifact.</p>
            </main>
        );
    }

    const selectedFile =
        files.find((file) => file.name === params.file) ?? files[0];

    return (
        <main className="flex h-screen flex-col overflow-hidden bg-background">
            <header className="flex h-8 shrink-0 items-center justify-center border-b border-border bg-background px-4">
                <div className="flex items-center gap-4">
                    <SignalFileMenu
                        files={files}
                        selectedFile={selectedFile.name}
                    />
                    <PageInfo />
                </div>
            </header>
            <iframe
                title={selectedFile.name}
                src={getSignalUrl(selectedFile.name)}
                className="min-h-0 w-full flex-1 border-0"
            />
        </main>
    );
}

const PageInfo = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="About signal artifacts"
                >
                    <Info className="size-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Signals - Weekly email digest</DialogTitle>
                    <DialogDescription>
                        Inbox Signal turns a week of newsletters into one
                        carefully checked page.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 text-sm text-muted-foreground">
                    <section className="space-y-1.5">
                        <h3 className="font-medium text-foreground">
                            What it is
                        </h3>
                        <p>
                            A scheduled task runs every Monday at 11:00 AM
                            (Dhaka time). It reads the past week of email from
                            your Spark inbox, shown as{" "}
                            <strong>newsletter@msar.me</strong>, and turns it
                            into one HTML page called Inbox Signal. The page is
                            saved to Documents/Email as
                            Inbox-Signal-YYYY-MM-DD.html.
                        </p>
                    </section>
                    <section className="space-y-1.5">
                        <h3 className="font-medium text-foreground">
                            How it works
                        </h3>
                        <ol className="list-decimal space-y-2 pl-5">
                            <li>
                                <span className="font-medium text-foreground">
                                    Collects:
                                </span>{" "}
                                pulls every email from the last 7 days through
                                my newsletter email address, mostly newsletters
                                such as TLDR, Latent.Space, ByteByteGo and
                                Pragmatic Engineer.
                            </li>
                            <li>
                                <span className="font-medium text-foreground">
                                    Extracts:
                                </span>{" "}
                                5–6 parallel subagents read themed batches,
                                identify each email&apos;s actual argument and
                                numbers, merge duplicate stories, and skip
                                sponsor sections.
                            </li>
                            <li>
                                <span className="font-medium text-foreground">
                                    Builds:
                                </span>{" "}
                                copies last week&apos;s design and fills in the
                                new content in this order: Needs you; The five,
                                if you only read five; themed sections; Pointer
                                items; Quick hits; and Safe to skip. The page
                                also includes dark mode, a contents rail, mark
                                read checkboxes and a scroll-up button.
                            </li>
                            <li>
                                <span className="font-medium text-foreground">
                                    Fact-checks:
                                </span>{" "}
                                a separate subagent re-reads the source emails
                                for 8–10 specific claims and fixes or softens
                                anything it cannot confirm.
                            </li>
                            <li>
                                <span className="font-medium text-foreground">
                                    Delivers and cleans up:
                                </span>{" "}
                                saves the file to your folder, sends it in chat,
                                marks unread emails as read, and sends a push
                                notification with a short summary. It is never
                                published as an artifact.
                            </li>
                        </ol>
                    </section>
                    <section className="space-y-1.5">
                        <h3 className="font-medium text-foreground">
                            Why it matters
                        </h3>
                        <ul className="list-disc space-y-1.5 pl-5">
                            <li>
                                Turns dozens of newsletters into a quick skim.
                            </li>
                            <li>
                                Preserves key ideas and numbers, not just
                                headlines.
                            </li>
                            <li>Surfaces messages that need a reply.</li>
                            <li>
                                Ranks “The five” for an engineering leader at a
                                software consultancy.
                            </li>
                            <li>
                                Uses fact-checking to catch unsupported figures.
                            </li>
                            <li>
                                Keeps the inbox clean by clearing unread mail
                                weekly.
                            </li>
                        </ul>
                    </section>
                    <section className="space-y-1.5">
                        <h3 className="font-medium text-foreground">
                            This page&apos;s refresh & status
                        </h3>
                        <p>
                            The file list updates automatically every 7 days
                            when new signals are published.
                        </p>
                        <p>
                            The file list and latest snapshot shown here are
                            refreshed at most once every 24 hours. A newly
                            published signal can therefore take up to a day to
                            appear here.
                        </p>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
};
