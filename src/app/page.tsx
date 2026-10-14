import { HeaderLinks } from "@/components/header-links";
import LinksList from "@/components/LinksList";
import { Bookmark } from "lucide-react";
import { Suspense } from "react";

export default function Home() {
    return (
        <div className="relative min-h-screen bg-background">
            {/* Subtle backdrop */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,var(--color-secondary),transparent_70%)]"
            />

            <div className="relative mx-auto max-w-2xl px-4 pb-12 pt-10 md:pt-16">
                {/* Header */}
                <header className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary shadow-sm">
                            <Bookmark className="size-5 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-bold tracking-wide text-muted-foreground">
                            pockets
                        </span>
                    </div>
                    <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                        Things I Saved!
                    </h1>
                    <p className="mt-2 max-w-lg font-medium text-muted-foreground">
                        A curated collection of everything I&apos;ve saved for
                        later.
                    </p>
                    <Suspense>
                        <HeaderLinks />
                    </Suspense>
                </header>

                {/* Links List */}
                <main>
                    <LinksList />
                </main>

                {/* Footer */}
                <footer className="mt-12 border-t border-border pt-6">
                    <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                        <span>
                            Curated by{" "}
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://msar.me"
                                className="font-semibold hover:text-foreground"
                            >
                                Saiful Alam
                            </a>
                        </span>
                        <span aria-hidden>·</span>
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://github.com/4msar/link-hub"
                            className="font-semibold hover:text-foreground"
                        >
                            Github
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    );
}
