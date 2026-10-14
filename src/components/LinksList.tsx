"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Loader2, Search, SearchX } from "lucide-react";
import { useInfiniteLinks } from "@/hooks/useLinks";
import { useHomeSettings } from "@/hooks/useHomeSettings";
import LinkCard from "./LinkCard";
import { HomeSettings } from "./HomeSettings";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/skeleton";

const LinkSkeleton = () => (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <Skeleton className="size-10 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
        </div>
    </div>
);

const LinksList = () => {
    const [search, setSearch] = useState("");
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const searchRef = useRef<HTMLInputElement>(null);
    const observerTarget = useRef<HTMLDivElement>(null);
    const { settings } = useHomeSettings();
    const isInfinite = settings.loadMode === "infinite";

    const {
        data,
        error,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteLinks({ search, include_timestamps: "true" });

    const links = data?.pages.flatMap((page) => page.data) ?? [];
    const total = data?.pages[0]?.meta?.total;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        clearTimeout(timer.current);
        const value = event.target.value;
        timer.current = setTimeout(() => setSearch(value.trim()), 500);
    };

    // Focus search with "/"
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (
                event.key !== "/" ||
                target.isContentEditable ||
                ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
            ) {
                return;
            }
            event.preventDefault();
            searchRef.current?.focus();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    // Infinite scroll trigger
    useEffect(() => {
        const target = observerTarget.current;
        if (!isInfinite || !target || !hasNextPage) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { rootMargin: "400px 0px" },
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [isInfinite, hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="space-y-5">
            <div className="sticky top-0 z-10 -mx-4 bg-background/80 px-4 py-3 backdrop-blur-md supports-backdrop-filter:bg-background/70">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            ref={searchRef}
                            type="search"
                            name="search"
                            placeholder="Search saved links..."
                            aria-label="Search saved links"
                            onChange={handleChange}
                            className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-12 text-sm font-medium text-foreground shadow-xs outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
                        />
                        <Kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 sm:inline-flex">
                            /
                        </Kbd>
                    </div>
                    <HomeSettings />
                </div>
            </div>

            {typeof total === "number" && (
                <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {search
                        ? `${total} result${total === 1 ? "" : "s"} for “${search}”`
                        : `${total} saved item${total === 1 ? "" : "s"}`}
                </p>
            )}

            {error && (
                <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                    <p className="font-semibold text-foreground">
                        Failed to load links
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Please try again later
                    </p>
                </div>
            )}

            {isLoading && (
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <LinkSkeleton key={index} />
                    ))}
                </div>
            )}

            {!isLoading && !error && links.length === 0 && (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-14 text-center">
                    <SearchX className="mb-3 size-8 text-muted-foreground/60" />
                    <p className="font-semibold text-foreground">
                        Nothing found
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {search
                            ? "Try a different search term."
                            : "No links available yet."}
                    </p>
                </div>
            )}

            {links.length > 0 && (
                <div className="space-y-3">
                    {links.map((link, index) => (
                        <LinkCard key={`${link.id}-${index}`} link={link} />
                    ))}
                </div>
            )}

            {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            )}

            {!isInfinite && hasNextPage && !isFetchingNextPage && (
                <div className="flex flex-col items-center gap-2 pt-2">
                    <Button
                        variant="outline"
                        className="rounded-full px-6"
                        onClick={() => fetchNextPage()}
                    >
                        Load more
                    </Button>
                    {typeof total === "number" && (
                        <p className="text-xs text-muted-foreground">
                            Showing {links.length} of {total}
                        </p>
                    )}
                </div>
            )}

            {!isLoading && !hasNextPage && links.length > 0 && (
                <p className="py-4 text-center text-xs font-semibold text-muted-foreground/60">
                    You&apos;ve reached the end
                </p>
            )}

            {isInfinite && <div ref={observerTarget} className="h-px" />}
        </div>
    );
};

export default LinksList;
