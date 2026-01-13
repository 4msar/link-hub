import {
    ExternalLink,
    MessageSquare,
    FileText,
    ArrowUpRight,
} from "lucide-react";
import { LinkItem } from "@/types/link";
import { TransitionLink } from "./TransitionLink";
import { TooltipTitle } from "./tooltip";
import { cn } from "@/lib/utils";

interface LinkCardProps {
    link: LinkItem;
}

const LinkCard = ({ link }: LinkCardProps) => {
    const isUrl = link.type === "url" || link.type === "link";

    return (
        <div className="group relative">
            <div className="relative flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                {/* Header with Icon and Actions */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <a
                            href={link.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-0 pt-1"
                        >
                            <h3 className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors">
                                {link.name}
                            </h3>
                            <p className="text-sm text-muted-foreground/80 truncate mt-0.5">
                                {link.value}
                            </p>
                        </a>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <TooltipTitle title="View discussion">
                            <TransitionLink
                                href={link.slug}
                                className="p-2 rounded-lg hover:bg-secondary transition-colors bg-card border border-border"
                            >
                                <MessageSquare className="w-4 h-4" />
                            </TransitionLink>
                        </TooltipTitle>

                        {isUrl && (
                            <TooltipTitle title="Open link">
                                <a
                                    href={link.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg hover:bg-secondary transition-colors bg-card border border-border"
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                </a>
                            </TooltipTitle>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkCard;
