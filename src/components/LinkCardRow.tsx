import { LinkItem } from "@/types/link";
import { ArrowUpRight, FileText, MessageSquare } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { RefLink } from "./RefLink";
import { TransitionLink } from "./TransitionLink";
import { TooltipTitle } from "./tooltip";

interface LinkCardProps {
    link: LinkItem;
}

const getHostname = (value: string) => {
    try {
        return new URL(value).hostname.replace(/^www\./, "");
    } catch {
        return null;
    }
};

const getRelativeDate = (value?: string) => {
    if (!value) return null;
    // API returns "YYYY-MM-DD HH:mm:ss", which Safari can't parse
    const date = new Date(value.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return null;
    return formatDistanceToNowStrict(date, { addSuffix: true });
};

export const LinkCardRow = ({ link }: LinkCardProps) => {
    const isUrl = link.link.startsWith("http");
    const hostname = isUrl ? getHostname(link.link) : null;
    const relativeDate = getRelativeDate(link.created_at);
    const monogram = (hostname ?? link.title).charAt(0).toUpperCase();

    const content = (
        <div className="flex min-w-0 flex-1 items-start gap-4">
            <div
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-sm font-extrabold text-foreground/70 transition-colors group-hover:border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground"
            >
                {isUrl ? monogram : <FileText className="size-4" />}
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground">
                    {link.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <span className="truncate">
                        {hostname ?? (isUrl ? link.link : "Note")}
                    </span>
                    {relativeDate && (
                        <>
                            <span aria-hidden className="text-muted-foreground/40">
                                •
                            </span>
                            <span className="shrink-0">{relativeDate}</span>
                        </>
                    )}
                </p>
            </div>
        </div>
    );

    return (
        <article className="group relative flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
            {isUrl ? (
                <RefLink
                    href={link.link}
                    className="flex min-w-0 flex-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {content}
                </RefLink>
            ) : (
                <TransitionLink
                    href={link.slug}
                    className="flex min-w-0 flex-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {content}
                </TransitionLink>
            )}

            <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity md:opacity-60 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                <TooltipTitle title="View discussion">
                    <span>
                        <TransitionLink
                            href={link.slug}
                            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                            <MessageSquare className="size-4" />
                            <span className="sr-only">View discussion</span>
                        </TransitionLink>
                    </span>
                </TooltipTitle>
                {isUrl && (
                    <TooltipTitle title="Open link">
                        <span>
                            <RefLink
                                href={link.link}
                                className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                                <ArrowUpRight className="size-4" />
                                <span className="sr-only">Open link</span>
                            </RefLink>
                        </span>
                    </TooltipTitle>
                )}
            </div>
        </article>
    );
};
