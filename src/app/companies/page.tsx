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

// Keeps the search term when moving between pages
const pageHref = (page: number, q: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/companies?${query}` : "/companies";
};

export default async function CompaniesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const { page: rawPage, q: rawQuery } = await searchParams;
    const requested = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
    const q = (rawQuery ?? "").trim().slice(0, 200);

    let result: Awaited<ReturnType<typeof getCompaniesPage>> | null = null;
    try {
        result = await getCompaniesPage(requested, PER_PAGE, q || undefined);
    } catch {
        result = null;
    }

    const companies = result?.data ?? [];
    const total = result?.meta?.total ?? 0;
    const lastPage = result?.meta?.last_page ?? 1;

    // Past the end (e.g. items were deleted): send the visitor to the last page
    if (result && requested > lastPage && total > 0) {
        redirect(pageHref(lastPage, q));
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
                        {q && ` matching "${q}"`}
                        {lastPage > 1 && ` · page ${currentPage} of ${lastPage}`}
                    </p>
                </header>

                <form
                    action="/companies"
                    method="get"
                    role="search"
                    className="mb-6 flex gap-2"
                >
                    <input
                        type="search"
                        name="q"
                        defaultValue={q}
                        placeholder="Search companies by name or link"
                        aria-label="Search companies"
                        className="h-10 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                    />
                    <button
                        type="submit"
                        className="h-10 rounded-md border border-border px-4 text-sm text-foreground hover:bg-muted/50"
                    >
                        Search
                    </button>
                    {q && (
                        <Link
                            href="/companies"
                            className="inline-flex h-10 items-center rounded-md px-3 text-sm text-muted-foreground hover:text-foreground"
                        >
                            Clear
                        </Link>
                    )}
                </form>

                {companies.length === 0 ? (
                    <p className="text-muted-foreground">
                        {q ? `No companies match "${q}".` : "No companies yet."}
                    </p>
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
                                href={pageHref(currentPage - 1, q)}
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
                                href={pageHref(currentPage + 1, q)}
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
