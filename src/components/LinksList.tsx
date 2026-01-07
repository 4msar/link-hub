import { useState } from "react";
import { useLinks } from "@/hooks/useLinks";
import LinkCard from "./LinkCard";
import { Loader2 } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const LinksList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const {
        data: response,
        isLoading,
        error,
    } = useLinks({ page: currentPage });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
        );
    }

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

    if (!response || !response.data || response.data.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No links available</p>
            </div>
        );
    }

    const links = response.data;

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                {links.map((link, index) => (
                    <LinkCard
                        key={`${link.name}-${response.from + index}`}
                        link={link}
                    />
                ))}
            </div>

            {(response.prev_page_url || response.next_page_url) && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className={
                                    !response.prev_page_url
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                }
                            />
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className={
                                    !response.next_page_url
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default LinksList;
