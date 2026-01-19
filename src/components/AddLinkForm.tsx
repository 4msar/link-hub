"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getLinkMetaData } from "@/lib/api";

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
    const [type, setType] = useState<"text" | "url" | "link">("url");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const getLinkDetails = async (linkValue: string) => {
        // check if valid url
        if (!/^https?:\/\//i.test(linkValue)) {
            return;
        }
        try {
            const response = await getLinkMetaData(linkValue);

            if (response.title) {
                setName(response.title);
                setType("link");
            }
        } catch (error) {}
    };

    useEffect(() => {
        if (value) {
            getLinkDetails(value);
        } else {
            setName("");
        }
    }, [value]);

    // Auto-generate slug from name
    useEffect(() => {
        if (name) {
            setSlug(slugify(name));
        }
    }, [name]);

    return (
        <form onSubmit={handleAddLink} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="value">Link</Label>
                <Input
                    id="value"
                    type="url"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="URL or text content"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Link name"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="link-slug"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                    id="type"
                    value={type}
                    onChange={(e) =>
                        setType(e.target.value as "text" | "url" | "link")
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="url">URL</option>
                    <option value="text">Text</option>
                    <option value="link">Link</option>
                </select>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Link...
                    </>
                ) : (
                    "Add Link"
                )}
            </Button>
        </form>
    );
};
