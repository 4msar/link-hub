"use client";

import { useState, useEffect, useRef } from "react";
import { useLinks } from "@/hooks/useLinks";
import LinkCard from "./LinkCard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkItem } from "@/types/link";

const LinksList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [allLinks, setAllLinks] = useState<LinkItem[]>([]);
    const observerTarget = useRef<HTMLDivElement>(null);

    const {
        data: response,
        isLoading,
        error,
    } = useLinks({ page: currentPage, search });

    useEffect(() => {
        if (response?.data) {
            setAllLinks((prev) => {
                // If it's page 1, replace all links, otherwise append
                if (currentPage === 1) {
                    return response.data;
                }
                // Append new links
                return [...prev, ...response.data];
            });
        }
    }, [response, currentPage]);

    const handleChange = (event) => {
        clearTimeout(timer.current);

        timer.current = setTimeout(() => {
            setSearch(event.target.value);
            setCurrentPage(1); // Reset to first page on new search
        }, 500);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    response?.next_page_url &&
                    !isLoading
                ) {
                    setCurrentPage((prev) => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [response?.next_page_url, isLoading]);

    return (
        <div className="space-y-6">
            <Input
                placeholder="Search here..."
                type="search"
                onChange={handleChange}
                name="search"
                className="max-w-full mx-auto"
            />

            {error && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        Failed to load links
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                        Please try again later
                    </p>
                </div>
            )}

            {!isLoading && allLinks.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No links available</p>
                </div>
            )}

            {allLinks.length > 0 && (
                <div className="space-y-3">
                    {allLinks.map((link, index) => (
                        <LinkCard key={`${link.name}-${index}`} link={link} />
                    ))}
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                </div>
            )}

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="h-4" />
        </div>
    );
};

export default LinksList;
