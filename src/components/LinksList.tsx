import { useLinks } from '@/hooks/useLinks';
import LinkCard from './LinkCard';
import { Loader2 } from 'lucide-react';

interface LinksListProps {
  apiUrl?: string;
}

const LinksList = ({ apiUrl }: LinksListProps) => {
  const { data: links, isLoading, error } = useLinks(apiUrl);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load links</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Please try again later</p>
      </div>
    );
  }

  if (!links || links.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No links available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <LinkCard key={`${link.name}-${index}`} link={link} />
      ))}
    </div>
  );
};

export default LinksList;
