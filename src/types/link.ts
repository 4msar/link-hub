export interface LinkItem {
    id: string | number;
    name: string;
    slug: string;
    value: string;
    type: "text" | "url" | "link";
    created_at?: string;
    updated_at?: string;
}

export interface LinksResponse {
    data: LinkItem[];
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
        total?: number;
        path?: string;
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
    data: LinkItem;
    project: ProjectDetails;
}

export interface Comment extends Omit<LinkItem, "type"> {
    type: string;
}
