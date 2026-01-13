import { useQuery } from "@tanstack/react-query";
import { LinksResponse } from "@/types/link";

export const fetchLinks = async (
    params: Record<string, string | number>
): Promise<LinksResponse> => {
    const queryParams = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, value.toString()])
    ).toString();

    const response = await fetch(`/api/links?${queryParams}`);
    if (!response.ok) {
        throw new Error("Failed to fetch links");
    }
    const data: LinksResponse = await response.json();
    return data;
};

export const useLinks = (queryParams: Record<string, string | number> = {}) => {
    return useQuery({
        queryKey: ["links", queryParams],
        queryFn: () => fetchLinks(queryParams),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
