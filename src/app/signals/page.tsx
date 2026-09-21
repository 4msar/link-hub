import { SignalFileMenu } from "@/components/SignalFileMenu";
import {
    getLatestSignalMetadata,
    getSignalFiles,
    getSignalUrl,
} from "@/lib/signals";
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
                <SignalFileMenu
                    files={files}
                    selectedFile={selectedFile.name}
                />
            </header>
            <iframe
                title={selectedFile.name}
                src={getSignalUrl(selectedFile.name)}
                className="min-h-0 w-full flex-1 border-0"
            />
        </main>
    );
}
