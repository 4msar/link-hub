import { LinkPreviews } from "@/components/LinkPreviews";
import { getLinks } from "@/lib/api";
import type { LinkItem } from "@/types/link";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const CATEGORY_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PER_PAGE = 100;

const toTitle = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");

const hostOf = (href: string) => {
    try {
        return new URL(href).hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
};

// Every item in one category. Category pages are plain link lists, so no
// comments and no per-item detail pages.
const fetchCategoryItems = async (name: string): Promise<LinkItem[]> => {
    const items: LinkItem[] = [];
    let page = 1;
    let lastPage = 1;

    do {
        const response = await getLinks({
            category: name,
            page,
            per_page: PER_PAGE,
        });
        items.push(...(response.data || []));
        lastPage = response.meta?.last_page ?? page;
        page++;
    } while (page <= lastPage);

    return items;
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ name: string }>;
}): Promise<Metadata> {
    const { name } = await params;
    const title = `${toTitle(name)} links`;
    return {
        title,
        description: `Saved ${name} links on Pockets.`,
        alternates: { canonical: `/category/${encodeURIComponent(name)}` },
    };
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ name: string }>;
}) {
    const { name: raw } = await params;
    const name = decodeURIComponent(raw).toLowerCase();

    if (!CATEGORY_REGEX.test(name)) {
        notFound();
    }
    if (name === "link") {
        redirect("/");
    }

    const items = await fetchCategoryItems(name);
    if (items.length === 0) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-2xl px-4 pb-12 pt-10 md:pt-16">
                <header className="mb-8">
                    <Link
                        href="/categories"
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        ← All categories
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-foreground">
                        {toTitle(name)}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {items.length} {items.length === 1 ? "item" : "items"}
                    </p>
                </header>

                <div data-link-previews>
                    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                        {items.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col gap-0.5 px-4 py-3 hover:bg-muted/50"
                                >
                                    <span className="font-medium text-foreground">
                                        {item.title}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {hostOf(item.link)}
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <LinkPreviews />
        </div>
    );
}
