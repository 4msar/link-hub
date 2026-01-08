import { useState, useEffect } from "react";
import { useLinks } from "@/hooks/useLinks";
import LinkCard from "./LinkCard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkItem } from "@/types/link";

const LinksList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [allLinks, setAllLinks] = useState<LinkItem[]>([]);
    const {
        data: response,
        isLoading,
        error,
    } = useLinks({ page: currentPage });

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

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Failed to load links</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                    Please try again later
                </p>
            </div>
        );
    }

    if (!isLoading && allLinks.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No links available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                {allLinks.map((link, index) => (
                    <LinkCard key={`${link.name}-${index}`} link={link} />
                ))}
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                </div>
            )}

            {response?.next_page_url && !isLoading && (
                <div className="flex justify-center">
                    <Button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        variant="outline"
                        className="w-full sm:w-auto"
                    >
                        Load More
                    </Button>
                </div>
            )}
        </div>
    );
};

export default LinksList;
