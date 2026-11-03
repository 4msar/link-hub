/**
 * API utility functions for fetching links and comments.
 *
 * @module api
 * This modules should only use in backend/server-side code.
 */
import {
    LinkDetailsResponse,
    LinkItem,
    LinksResponse,
    Submission,
    SubmissionsResponse,
} from "@/types/link";
import { apiKey, BASE_API_URL, projectID } from "./constant";

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
                "X-Project-Id": projectID,
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
                "X-Project-Id": projectID,
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

export const getComments = async (slug: string): Promise<LinksResponse> => {
    const response = await fetch(
        `${BASE_API_URL}/comments/${projectID}/${slug}?per_page=50`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Id": projectID,
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
    slug: string,
    name: string,
    comment: string,
): Promise<unknown> => {
    if (!comment) {
        throw new Error("Comment cannot be empty");
    }

    const response = await fetch(
        `${BASE_API_URL}/comments/${projectID}/${slug}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Id": projectID,
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                name: name || "Anonymous",
                comment: comment || "",
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
            "X-Project-Id": projectID,
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

export type ApiResult<T> = { ok: boolean; status: number; data: T };

const submissionsRequest = async <T>(
    path: string,
    init: RequestInit = {},
): Promise<ApiResult<T>> => {
    const response = await fetch(
        `${BASE_API_URL}/submissions/${projectID}${path}`,
        {
            ...init,
            headers: {
                "Content-Type": "application/json",
                "X-Project-Id": projectID,
                Authorization: `Bearer ${apiKey}`,
            },
            cache: "no-store",
        },
    );

    const data = (await response.json().catch(() => ({}))) as T;
    return { ok: response.ok, status: response.status, data };
};

export const submitLink = (data: { title: string; link: string }) =>
    submissionsRequest<{ submission?: Submission; error?: string }>("", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const getSubmissions = (params: {
    status: "pending" | "all";
    page?: number;
    per_page?: number;
}) => {
    const query = new URLSearchParams({
        status: params.status,
        page: String(params.page ?? 1),
        per_page: String(params.per_page ?? 20),
    });
    return submissionsRequest<SubmissionsResponse & { error?: string }>(
        `?${query.toString()}`,
    );
};

export const approveSubmission = (
    id: number,
    data: { title?: string; link?: string } = {},
) =>
    submissionsRequest<{ item?: LinkItem; error?: string }>(
        `/${id}/approve`,
        { method: "POST", body: JSON.stringify(data) },
    );

export const rejectSubmission = (id: number) =>
    submissionsRequest<{ submission?: Submission; error?: string }>(
        `/${id}/reject`,
        { method: "POST" },
    );

export const deleteSubmission = (id: number) =>
    submissionsRequest<{ message?: string; error?: string }>(`/${id}`, {
        method: "DELETE",
    });
