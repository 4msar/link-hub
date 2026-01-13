import { ExternalLink, Eye, FileText, Link2 } from "lucide-react";
import { LinkItem } from "@/types/link";
import { TransitionLink } from "./TransitionLink";
import { TooltipTitle } from "./tooltip";

interface LinkCardProps {
    link: LinkItem;
}

const LinkCard = ({ link }: LinkCardProps) => {
    const isUrl = link.type === "url" || link.type === "link";

    const content = (
        <div className="link-card group relative flex items-start gap-4 p-5 rounded-2xl border border-border overflow-hidden">
            {/* Gradient accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Icon Section */}
            <div className="flex-shrink-0 relative">
                <TooltipTitle title="Click to view discussion">
                    <TransitionLink
                        href={link.slug}
                        className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md border border-border/50"
                    >
                        {isUrl ? (
                            <Link2 className="w-5 h-5 text-accent transition-transform group-hover:rotate-12" />
                        ) : (
                            <FileText className="w-5 h-5 text-muted-foreground" />
                        )}
                    </TransitionLink>
                </TooltipTitle>
                
                {/* Type Badge */}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-background flex items-center justify-center">
                    {isUrl ? (
                        <ExternalLink className="w-3 h-3 text-accent" />
                    ) : (
                        <Eye className="w-3 h-3 text-muted-foreground" />
                    )}
                </span>
            </div>

            {/* Content Section */}
            <a
                href={link.value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 flex flex-col gap-1.5 group/link"
            >
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground truncate group-hover/link:text-accent transition-colors duration-200">
                        {link.name}
                    </h3>
                    {isUrl && (
                        <div className="flex-shrink-0 w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ExternalLink className="w-3.5 h-3.5 text-accent" />
                        </div>
                    )}
                </div>
                
                <p className="text-sm text-muted-foreground truncate group-hover/link:text-muted-foreground/80 transition-colors">
                    {link.value}
                </p>
                
                {/* Type Label */}
                <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/50 text-xs font-medium text-muted-foreground">
                        {isUrl ? "External Link" : "Document"}
                    </span>
                </div>
            </a>
        </div>
    );

    if (isUrl) {
        return <div className="block">{content}</div>;
    }

    return content;
};

export default LinkCard;
