export interface LinkItem {
    name: string;
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
