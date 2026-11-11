import { LinkPreviews } from "@/components/LinkPreviews";
import { getCompanies } from "@/lib/api";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Companies",
    description: "Companies saved on Pockets.",
    alternates: { canonical: "/companies" },
};

const hostOf = (href: string) => {
    try {
        return new URL(href).hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
};

export default async function CompaniesPage() {
    let companies: Awaited<ReturnType<typeof getCompanies>> = [];
    try {
        companies = await getCompanies();
    } catch {
        companies = [];
    }

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
                        {companies.length} {companies.length === 1 ? "company" : "companies"}
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
            </div>
            <LinkPreviews />
        </div>
    );
}
