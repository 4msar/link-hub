export interface LinkItem {
  name: string;
  value: string;
  type: 'text' | 'url' | 'link';
}

export interface LinksResponse {
  data: LinkItem[];
}
