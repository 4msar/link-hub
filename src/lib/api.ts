/**
 * API utility functions for fetching links and comments.
 *
 * @module api
 * This modules should only use in backend/server-side code.
 */
import { LinkDetailsResponse, LinksResponse } from "@/types/link";
import { apiKey, BASE_API_URL, commentsProjectID, projectID } from "./constant";

export const getLinks = async (
    params: Record<string, string | number>,
): Promise<LinksResponse> => {
    const queryParams = new URLSearchParams(
        Object.entries(params)
            .filter(([_, value]) => value)
            .map(([key, value]) => [key, value.toString()]),
    ).toString();

    const response = await fetch(
        `${BASE_API_URL}/values/${projectID}?${queryParams}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            next: {
                revalidate: 3600, // 1 hour
                tags: ["links"],
            },
        } as RequestInit,
    );

    if (!response.ok) {
        throw new Error(`Error fetching links: ${response.statusText}`);
    }

    const data: LinksResponse = await response.json();
    return data;
};

export const getLinkBySlug = async (
    slug: string,
    params?: Record<string, string | number>,
): Promise<LinkDetailsResponse> => {
    const queryParams = params
        ? new URLSearchParams(
              Object.entries(params)
                  .filter(([_, value]) => value)
                  .map(([key, value]) => [key, value.toString()]),
          ).toString()
        : "";

    const response = await fetch(
        `${BASE_API_URL}/values/${projectID}/${slug}${queryParams ? `?${queryParams}` : ""}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            cache: "force-cache",
            next: {
                tags: ["links"],
                revalidate: 3600, // 1 hour
            },
        } as RequestInit,
    );

    if (!response.ok) {
        throw new Error(`Error fetching link by slug: ${response.statusText}`);
    }

    const data: LinkDetailsResponse = await response.json();
    return data;
};

export const getComments = async (id: string): Promise<LinksResponse> => {
    const response = await fetch(
        `${BASE_API_URL}/values/${commentsProjectID}?type=comment:${id}&include_timestamps=true&per_page=50`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            cache: "no-store",
        } as RequestInit,
    );

    if (!response.ok) {
        throw new Error(`Error fetching comments: ${response.statusText}`);
    }

    const data: LinksResponse = await response.json();
    return data;
};

export const postComment = async (
    linkId: string | number,
    name: string,
    comment: string,
): Promise<unknown> => {
    const response = await fetch(
        `${BASE_API_URL}/values/${commentsProjectID}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                name: name || "Anonymous",
                value: comment,
                slug: `comment-${Date.now()}`,
                type: `comment:${linkId}`,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(`Error posting comment: ${response.statusText}`);
    }

    return response.json();
};

export const createLink = async (data: {
    name: string;
    slug: string;
    value: string;
    type: "text" | "url" | "link";
}): Promise<unknown> => {
    const response = await fetch(`${BASE_API_URL}/values/${projectID}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Error creating link: ${response.statusText}`);
    }

    return response.json();
};

export const getLinkMetaData = async (
    url: string,
): Promise<{
    title: string;
    description: string;
}> => {
    try {
        const response = await fetch(
            `/api/metadata?url=${encodeURIComponent(url)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "force-cache",
                next: { revalidate: 3600 }, // 1 hour
            },
        );

        if (!response.ok) {
            throw new Error(
                `Error fetching link metadata: ${response.statusText}`,
            );
        }

        const data = await response.json();
        return {
            title: data.title || "",
            description: data.description || "",
        };
    } catch (error) {
        return { title: "", description: "" };
    }
};
