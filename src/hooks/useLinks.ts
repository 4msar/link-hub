import { useQuery } from '@tanstack/react-query';
import { LinksResponse, LinkItem } from '@/types/link';

// Mock data for demonstration
const mockLinks: LinkItem[] = [
  { name: 'My Portfolio', value: 'https://myportfolio.com', type: 'url' },
  { name: 'Latest Blog Post', value: 'https://myblog.com/article', type: 'link' },
  { name: 'Email Contact', value: 'hello@example.com', type: 'text' },
  { name: 'GitHub Profile', value: 'https://github.com/username', type: 'url' },
  { name: 'Twitter / X', value: 'https://x.com/username', type: 'link' },
  { name: 'Company Name', value: 'Acme Corporation', type: 'text' },
  { name: 'Documentation', value: 'https://docs.example.com', type: 'url' },
  { name: 'Support Center', value: 'https://support.example.com/help', type: 'link' },
];

const fetchLinks = async (apiUrl?: string): Promise<LinkItem[]> => {
  if (apiUrl) {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch links');
    }
    const data: LinksResponse = await response.json();
    return data.data;
  }
  
  // Return mock data if no API URL provided
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockLinks), 500);
  });
};

export const useLinks = (apiUrl?: string) => {
  return useQuery({
    queryKey: ['links', apiUrl],
    queryFn: () => fetchLinks(apiUrl),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
