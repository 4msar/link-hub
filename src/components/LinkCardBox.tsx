import { LinkItem } from "@/types/link";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import { RefLink } from "./RefLink";
import { TransitionLink } from "./TransitionLink";
import { TooltipTitle } from "./tooltip";

interface LinkCardProps {
    link: LinkItem;
}

export const LinkCardBox = ({ link }: LinkCardProps) => {
    const isUrl = link.type === "url" || link.type === "link";

    return (
        <div className="group relative">
            <div className="relative flex flex-col h-full rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
                {/* Main Content Area */}
                <RefLink href={link.value}
                    className="flex-1 p-6 flex flex-col gap-4"
                >
                    {/* Icon/Visual Element */}
                    {/* <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <ExternalLink className="w-6 h-6 text-primary" />
                    </div> */}

                    {/* Title and URL */}
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-gray-800 transition-all line-clamp-2">
                            {link.name}
                        </h3>
                        <p className="text-sm font-semibold text-muted-foreground/80 line-clamp-2 break-all">
                            {link.value}
                        </p>
                    </div>
                </RefLink>

                {/* Footer with Actions */}
                <div className="border-t border-border bg-muted/30 px-4 py-3 flex items-center justify-between gap-2">
                    <TooltipTitle title="View discussion">
                        <span>
                            <TransitionLink
                                href={link.slug}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:border-neutral-900/20 hover:bg-secondary transition-colors text-sm"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-muted-foreground">
                                    Discuss
                                </span>
                            </TransitionLink>
                        </span>
                    </TooltipTitle>

                    {isUrl && (
                        <TooltipTitle title="Open link">
                            <RefLink href={link.value}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary border border-transparent hover:border-neutral-900/20 transition-colors text-sm"
                            >
                                <span className="text-muted-foreground">
                                    Visit
                                </span>
                                <ArrowUpRight className="w-4 h-4" />
                            </RefLink>
                        </TooltipTitle>
                    )}
                </div>
            </div>
        </div>
    );
};
