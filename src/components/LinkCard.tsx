import { ExternalLink, Eye, FileText } from "lucide-react";
import { LinkItem } from "@/types/link";
import { TransitionLink } from "./TransitionLink";
import { TooltipTitle } from "./tooltip";

interface LinkCardProps {
    link: LinkItem;
}

const LinkCard = ({ link }: LinkCardProps) => {
    const isUrl = link.type === "url" || link.type === "link";

    const content = (
        <div className="link-card flex items-center gap-4 p-4 rounded-xl border border-border">
            <TooltipTitle title="Click to open discussion">
                <TransitionLink
                    href={link.slug}
                    className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"
                >
                    {isUrl ? (
                        <ExternalLink className="w-5 h-5 text-accent" />
                    ) : (
                        <FileText className="w-5 h-5 text-muted-foreground" />
                    )}
                </TransitionLink>
            </TooltipTitle>
            <a
                href={link.value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 flex items-center gap-3"
            >
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                        {link.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                        {link.value}
                    </p>
                </div>
                {isUrl && (
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
            </a>
        </div>
    );

    if (isUrl) {
        return <div className="block">{content}</div>;
    }

    return content;
};

export default LinkCard;
