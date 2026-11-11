"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Globe, Loader2, Plus } from "lucide-react";
import { getLinkMetaData } from "@/lib/api";

const DEFAULT_CATEGORY = "link";

// Categories are lowercase words joined by hyphens, e.g. "company" or "side-projects"
const normalizeCategory = (text: string): string =>
    text.trim().toLowerCase().replace(/\s+/g, "-") || DEFAULT_CATEGORY;

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
    const [category, setCategory] = useState(DEFAULT_CATEGORY);
    const [categories, setCategories] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingMeta, setIsFetchingMeta] = useState(false);

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/admin/links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pin,
                    name,
                    slug,
                    value,
                    category: normalizeCategory(category),
                }),
            });

            if (response.ok) {
                toast.success("Link added successfully!");
                // Reset form
                setName("");
                setSlug("");
                setValue("");
                setCategory(DEFAULT_CATEGORY);
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

    // Existing categories as suggestions
    useEffect(() => {
        let cancelled = false;
        fetch("/api/categories")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!cancelled && data?.categories) {
                    setCategories(data.categories.map((c: { name: string }) => c.name));
                }
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

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

            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                    id="category"
                    type="text"
                    list="category-options"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={DEFAULT_CATEGORY}
                    className="h-11"
                />
                <datalist id="category-options">
                    {categories.map((name) => (
                        <option key={name} value={name} />
                    ))}
                </datalist>
                <p className="text-xs text-muted-foreground">
                    Pick an existing category or type a new one. Defaults to {DEFAULT_CATEGORY}.
                </p>
            </div>

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
