export interface LinkItem {
    id: string | number;
    name: string;
    slug: string;
    value: string;
    type: "text" | "url" | "link";
}

export interface LinksResponse {
    data: LinkItem[];
    current_page: number;
    first_page_url: string;
    from: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
}

export interface ProjectDetails {
    id: string | number;
    name: string;
    slug: string;
    description?: string;
    status: string;
}

export interface LinkDetailsResponse {
    data: LinkItem;
    project: ProjectDetails;
}

export interface Comment extends Omit<LinkItem, "type"> {
    type: string;
}
