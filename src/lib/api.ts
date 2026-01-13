import { LinksResponse } from "@/types/link";
import { apiKey, BASE_API_URL, commentsProjectID, projectID } from "./constant";

export const getLinks = async (
    params: Record<string, string | number>
): Promise<LinksResponse> => {
    const queryParams = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, value.toString()])
    ).toString();

    const response = await fetch(
        `${BASE_API_URL}/values/${projectID}?${queryParams}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error fetching links: ${response.statusText}`);
    }

    const data: LinksResponse = await response.json();
    return data;
};

export const getLinkBySlug = async (slug: string): Promise<LinksResponse> => {
    const response = await fetch(
        `${BASE_API_URL}/values/${projectID}/${slug}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
        }
    );

    console.log("Fetching link for slug:", slug, response);

    if (!response.ok) {
        throw new Error(`Error fetching link by slug: ${response.statusText}`);
    }

    const data: LinksResponse = await response.json();
    return data;
};

export const getComments = async (id: string): Promise<LinksResponse> => {
    const response = await fetch(
        `${BASE_API_URL}/values/${commentsProjectID}?type=comment:${id}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error fetching comments: ${response.statusText}`);
    }

    const data: LinksResponse = await response.json();
    return data;
};
