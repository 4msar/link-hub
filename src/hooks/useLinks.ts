import { useQuery } from "@tanstack/react-query";
import { LinksResponse } from "@/types/link";
import { apiKey, projectID } from "@/lib/constant";

const fetchLinks = async (
    params: Record<string, string | number>
): Promise<LinksResponse> => {
    const queryParams = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, value.toString()])
    ).toString();

    const response = await fetch(
        `https://kv.fourorbit.com/api/values/${projectID}?${queryParams}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
        }
    );
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
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
