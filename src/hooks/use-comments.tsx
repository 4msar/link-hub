import { useQuery } from "@tanstack/react-query";
import { LinksResponse } from "@/types/link";

export const fetchComments = async (
    id: string | number,
): Promise<LinksResponse> => {
    const response = await fetch(`/api/comments/${id}`, {
        method: "GET",
        next: { revalidate: 300 }, // Revalidate every 5 minutes
    });
    if (!response.ok) {
        throw new Error("Failed to fetch comments");
    }
    const data: LinksResponse = await response.json();
    return data;
};

export const useComments = (id: string | number) => {
    return useQuery({
        queryKey: ["comments", id],
        queryFn: () => fetchComments(id),
        staleTime: 1000 * 60 * 5, // 5 minutes,
        refetchInterval: 1000 * 60 * 5, // 5 minutes
    });
};
