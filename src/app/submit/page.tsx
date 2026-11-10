import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { SubmitLinkForm } from "@/components/SubmitLinkForm";
import { TransitionLink } from "@/components/TransitionLink";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
    title: "Submit a link",
    description: "Suggest a link for the pockets collection.",
    alternates: { canonical: "/submit" },
    openGraph: {
        title: "Submit a link",
        description: "Suggest a link for the pockets collection.",
        url: "/submit",
        siteName: SITE_NAME,
        locale: "en_US",
        type: "website",
    },
};

export default function SubmitPage() {
    return (
        <div className="relative min-h-screen bg-background">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,var(--color-secondary),transparent_70%)]"
            />

            <div className="relative mx-auto max-w-xl px-4 pb-12 pt-10 md:pt-16">
                <header className="mb-8">
                    <TransitionLink
                        href="/"
                        className="flex w-fit items-center gap-3"
                    >
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary shadow-sm">
                            <Bookmark className="size-5 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-bold tracking-wide text-muted-foreground">
                            pockets
                        </span>
                    </TransitionLink>
                    <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                        Submit a link
                    </h1>
                    <p className="mt-2 max-w-lg font-medium text-muted-foreground">
                        Found something worth saving? Send it over. Every
                        submission is reviewed before it shows up here.
                    </p>
                </header>

                <main className="rounded-2xl border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
                    <SubmitLinkForm />
                </main>

                <p className="mt-6 text-center text-sm">
                    <TransitionLink
                        href="/"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        ← Back to home
                    </TransitionLink>
                </p>
            </div>
        </div>
    );
}
