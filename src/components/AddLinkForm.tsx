"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Globe, Link2, Loader2, Plus } from "lucide-react";
import { getLinkMetaData } from "@/lib/api";
import { cn } from "@/lib/utils";

type LinkType = "text" | "url" | "link";

const LINK_TYPES: { value: LinkType; label: string; icon: typeof Globe }[] = [
    { value: "url", label: "URL", icon: Globe },
    { value: "text", label: "Text", icon: FileText },
    { value: "link", label: "Link", icon: Link2 },
];

// Helper function to convert text to URL-friendly slug
const slugify = (text: string): string => {
    return text
        .toLowerCase() // Convert to lowercase
        .trim() // Trim whitespace from start and end
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^\w-]+/g, "") // Remove non-word characters (except hyphens)
        .replace(/-+/g, "-") // Remove duplicate hyphens
        .replace(/^-+|-+$/g, ""); // Trim hyphens from start and end
};

export const AddLinkForm = ({ pin }: { pin: string }) => {
    // Form state
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [value, setValue] = useState("");
    const [type, setType] = useState<LinkType>("url");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingMeta, setIsFetchingMeta] = useState(false);

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/admin/links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin, name, slug, value, type }),
            });

            if (response.ok) {
                toast.success("Link added successfully!");
                // Reset form
                setName("");
                setSlug("");
                setValue("");
                setType("url");
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to add link");
            }
        } catch (error) {
            toast.error("Failed to add link");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetch the page title for the entered URL (debounced)
    useEffect(() => {
        if (!value) {
            setName("");
            return;
        }
        // check if valid url
        if (!/^https?:\/\//i.test(value)) {
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            setIsFetchingMeta(true);
            try {
                const response = await getLinkMetaData(value);
                if (!cancelled && response.title) {
                    setName(response.title);
                    setType("link");
                }
            } catch (error) {
            } finally {
                if (!cancelled) setIsFetchingMeta(false);
            }
        }, 400);

        return () => {
            cancelled = true;
            clearTimeout(timer);
            setIsFetchingMeta(false);
        };
    }, [value]);

    // Auto-generate slug from name
    useEffect(() => {
        if (name) {
            setSlug(slugify(name));
        }
    }, [name]);

    return (
        <form onSubmit={handleAddLink} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="value">Link</Label>
                <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="value"
                        type="url"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="https://example.com/article"
                        className="h-11 pl-9 pr-9"
                        required
                    />
                    {isFetchingMeta && (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    Paste a URL and the name will be filled in automatically.
                </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Link name"
                        className="h-11"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <div className="flex h-11 rounded-md border border-input shadow-sm focus-within:ring-1 focus-within:ring-ring">
                        <span className="flex items-center pl-3 text-sm text-muted-foreground select-none">
                            /
                        </span>
                        <input
                            id="slug"
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="link-slug"
                            className="min-w-0 flex-1 bg-transparent px-1 pr-3 text-base md:text-sm outline-none placeholder:text-muted-foreground"
                            required
                        />
                    </div>
                </div>
            </div>

            <fieldset className="space-y-2">
                <legend className="text-sm font-medium leading-none mb-2">
                    Type
                </legend>
                <div
                    role="radiogroup"
                    className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
                >
                    {LINK_TYPES.map(({ value: option, label, icon: Icon }) => (
                        <button
                            key={option}
                            type="button"
                            role="radio"
                            aria-checked={type === option}
                            onClick={() => setType(option)}
                            className={cn(
                                "flex h-9 items-center justify-center gap-2 rounded-md text-sm font-medium transition-all",
                                type === option
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </fieldset>

            <Button
                type="submit"
                className="w-full h-11"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin" />
                        Adding Link...
                    </>
                ) : (
                    <>
                        <Plus />
                        Add Link
                    </>
                )}
            </Button>
        </form>
    );
};
