import { LinkPreviews } from "@/components/LinkPreviews";
import { getCompaniesPage } from "@/lib/api";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Companies",
    description: "Companies saved on Pockets.",
    alternates: { canonical: "/companies" },
};

const PER_PAGE = 50;

const hostOf = (href: string) => {
    try {
        return new URL(href).hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
};

const pageHref = (page: number) =>
    page <= 1 ? "/companies" : `/companies?page=${page}`;

export default async function CompaniesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page: rawPage } = await searchParams;
    const requested = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

    let result: Awaited<ReturnType<typeof getCompaniesPage>> | null = null;
    try {
        result = await getCompaniesPage(requested, PER_PAGE);
    } catch {
        result = null;
    }

    const companies = result?.data ?? [];
    const total = result?.meta?.total ?? 0;
    const lastPage = result?.meta?.last_page ?? 1;

    // Past the end (e.g. items were deleted): send the visitor to the last page
    if (result && requested > lastPage && total > 0) {
        redirect(pageHref(lastPage));
    }

    const currentPage = result?.meta?.current_page ?? requested;

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-2xl px-4 pb-12 pt-10 md:pt-16">
                <header className="mb-8">
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        ← Back to links
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-foreground">
                        Companies
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {total} {total === 1 ? "company" : "companies"}
                        {lastPage > 1 && ` · page ${currentPage} of ${lastPage}`}
                    </p>
                </header>

                {companies.length === 0 ? (
                    <p className="text-muted-foreground">No companies yet.</p>
                ) : (
                    <div data-link-previews>
                        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                            {companies.map((company) => (
                                <li key={company.id}>
                                    <a
                                        href={company.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col gap-0.5 px-4 py-3 hover:bg-muted/50"
                                    >
                                        <span className="font-medium text-foreground">
                                            {company.name}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {hostOf(company.link)}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {lastPage > 1 && (
                    <nav
                        aria-label="Companies pagination"
                        className="mt-6 flex items-center justify-between text-sm"
                    >
                        {currentPage > 1 ? (
                            <Link
                                href={pageHref(currentPage - 1)}
                                rel="prev"
                                className="rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-muted/50"
                            >
                                ← Previous
                            </Link>
                        ) : (
                            <span />
                        )}
                        <span className="text-muted-foreground">
                            Page {currentPage} of {lastPage}
                        </span>
                        {currentPage < lastPage ? (
                            <Link
                                href={pageHref(currentPage + 1)}
                                rel="next"
                                className="rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-muted/50"
                            >
                                Next →
                            </Link>
                        ) : (
                            <span />
                        )}
                    </nav>
                )}
            </div>
            <LinkPreviews />
        </div>
    );
}
