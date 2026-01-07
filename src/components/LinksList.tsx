import { useState, useMemo } from "react";
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

const ITEMS_PER_PAGE = 5;

const LinksList = () => {
    const { data: links, isLoading, error } = useLinks();
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = useMemo(() => {
        return links ? Math.ceil(links.length / ITEMS_PER_PAGE) : 0;
    }, [links]);

    const pageNumbers = useMemo(() => {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }, [totalPages]);

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

    if (!links || links.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No links available</p>
            </div>
        );
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentLinks = links.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                {currentLinks.map((link, index) => (
                    <LinkCard key={`${link.name}-${startIndex + index}`} link={link} />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(currentPage - 1)}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>

                        {pageNumbers.map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    onClick={() => handlePageChange(page)}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handlePageChange(currentPage + 1)}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default LinksList;
