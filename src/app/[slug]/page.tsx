import { LinkComments } from "@/components/LinkComments";
import { RefLink } from "@/components/RefLink";
import { TransitionLink } from "@/components/TransitionLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getLinkBySlug } from "@/lib/api";
import { ArrowLeft, ExternalLink, FileText, Link2 } from "lucide-react";
import { notFound } from "next/navigation";

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    try {
        const { slug } = await params;
        const data = await getLinkBySlug(slug, { include_timestamps: "true" });

        if (!data?.data) {
            notFound();
        }

        const link = data.data;
        const isUrl = link.type === "url" || link.type === "link";

        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    {/* Back Button */}
                    <TransitionLink href="/">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-6 gap-2 hover:gap-3 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Links
                        </Button>
                    </TransitionLink>

                    {/* Link Details Card */}
                    <Card className="mb-8">
                        <CardHeader className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                                    {isUrl ? (
                                        <Link2 className="w-6 h-6 text-primary-foreground" />
                                    ) : (
                                        <FileText className="w-6 h-6 text-primary-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl font-bold text-foreground mb-2">
                                        {link.name}
                                    </h1>
                                    <div className="flex items-center gap-4 flex-wrap mb-3">
                                        <Badge variant="secondary">
                                            {link.type}
                                        </Badge>

                                        <p className="text-sm text-muted-foreground">
                                            Created on{" "}
                                            {new Date(
                                                link.created_at,
                                            ).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">
                                        {isUrl ? "URL" : "Content"}
                                    </p>
                                    {isUrl ? (
                                        <RefLink href={link.value} className="flex items-center gap-2 text-primary hover:underline break-all">
                                            {link.value}
                                        </RefLink>
                                    ) : (
                                        <p className="text-foreground wrap-break-word whitespace-pre-wrap">
                                            {link.value}
                                        </p>
                                    )}
                                </div>

                                {isUrl && (
                                    <div className="pt-4">
                                        <Button
                                            asChild
                                            className="w-full gap-2"
                                        >
                                            <RefLink href={link.value}>
                                                Visit Link
                                                <ExternalLink className="w-4 h-4" />
                                            </RefLink>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Comments Section */}
                    <LinkComments linkId={link.id} />
                </div>
            </div>
        );
    } catch (error) {
        notFound();
    }
}
