"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Globe, Loader2, Send } from "lucide-react";
import { getLinkMetaData } from "@/lib/api";

export const SubmitLinkForm = () => {
    const [link, setLink] = useState("");
    const [title, setTitle] = useState("");
    const [titleEdited, setTitleEdited] = useState(false);
    const [isFetchingMeta, setIsFetchingMeta] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Fetch the page title for the entered URL (debounced), unless the
    // visitor already typed their own title
    useEffect(() => {
        if (titleEdited || !/^https?:\/\/\S+\.\S+/i.test(link)) {
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            setIsFetchingMeta(true);
            try {
                const response = await getLinkMetaData(link);
                if (!cancelled && response.title) {
                    setTitle(response.title);
                }
            } finally {
                if (!cancelled) setIsFetchingMeta(false);
            }
        }, 500);

        return () => {
            cancelled = true;
            clearTimeout(timer);
            setIsFetchingMeta(false);
        };
    }, [link, titleEdited]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, link }),
            });

            if (response.ok) {
                setSubmitted(true);
                setLink("");
                setTitle("");
                setTitleEdited(false);
            } else {
                const data = await response.json().catch(() => ({}));
                toast.error(data.error || "Failed to submit link");
            }
        } catch {
            toast.error("Failed to submit link");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <div>
                    <h2 className="text-lg font-semibold">Thanks!</h2>
                    <p className="text-sm text-muted-foreground">
                        Your link is waiting for review.
                    </p>
                </div>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Submit another
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="link">Link</Label>
                <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="link"
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://example.com/article"
                        className="h-11 pl-9 pr-9"
                        required
                        autoFocus
                    />
                    {isFetchingMeta && (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    Paste a URL and the title will be filled in automatically.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        setTitleEdited(e.target.value.length > 0);
                    }}
                    placeholder="What is this link about?"
                    className="h-11"
                    maxLength={200}
                    required
                />
            </div>

            <Button
                type="submit"
                className="h-11 w-full"
                disabled={isSubmitting || !link || !title}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send />
                        Submit for review
                    </>
                )}
            </Button>
        </form>
    );
};
