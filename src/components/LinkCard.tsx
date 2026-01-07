import { ExternalLink, FileText } from 'lucide-react';
import { LinkItem } from '@/types/link';

interface LinkCardProps {
  link: LinkItem;
}

const LinkCard = ({ link }: LinkCardProps) => {
  const isUrl = link.type === 'url' || link.type === 'link';

  const content = (
    <div className="link-card flex items-center gap-4 p-4 rounded-xl border border-border">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
        {isUrl ? (
          <ExternalLink className="w-5 h-5 text-accent" />
        ) : (
          <FileText className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{link.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{link.value}</p>
      </div>
      {isUrl && (
        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      )}
    </div>
  );

  if (isUrl) {
    return (
      <a
        href={link.value}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    );
  }

  return content;
};

export default LinkCard;
