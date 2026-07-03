export interface LinkItem {
    id: string | number;
    title: string;
    slug: string;
    link: string;
    created_at?: string;
}

export type LinksResponse = PaginatedItems<LinkItem>

export type PaginatedItems<T> = {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
        path: string;
    };
}

export interface ProjectDetails {
    id: string | number;
    name: string;
    slug: string;
    description?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface LinkDetailsResponse {
    item: LinkItem;
    project: ProjectDetails;
}

export type Comment = CommentItem

export interface CommentItem {
    id: string | number;
    name: string;
    comment: string;
    created_at: string;
}
