import { getCategories } from "@/lib/api";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Categories",
    description: "Browse Pockets by category.",
    alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
    let categories: { name: string; count: number }[] = [];
    try {
        categories = await getCategories();
    } catch {
        categories = [];
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
                        Categories
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Browse saved items by category.
                    </p>
                </header>

                {categories.length === 0 ? (
                    <p className="text-muted-foreground">No categories yet.</p>
                ) : (
                    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                        {categories.map((category) => (
                            <li key={category.name}>
                                <Link
                                    href={
                                        category.name === "link"
                                            ? "/"
                                            : `/category/${encodeURIComponent(category.name)}`
                                    }
                                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
                                >
                                    <span className="font-medium text-foreground">
                                        {category.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {category.count}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export const revalidate = 3600;