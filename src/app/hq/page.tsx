"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { getLinkMetaData } from "@/lib/api";

const ADMIN_PIN_KEY = "admin_pin";

export default function AdminPage() {
    const [pin, setPin] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);

    // Form state
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [value, setValue] = useState("");
    const [type, setType] = useState<"text" | "url" | "link">("url");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Verify PIN helper
    const verifyPin = async (pinToVerify: string) => {
        try {
            const response = await fetch("/api/admin/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin: pinToVerify }),
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    };

    // Check for stored PIN on mount
    useEffect(() => {
        const storedPin = localStorage.getItem(ADMIN_PIN_KEY);
        console.log("Stored PIN:", storedPin);
        if (storedPin) {
            setIsVerifying(true);
            verifyPin(storedPin).then((isValid) => {
                if (isValid) {
                    setPin(storedPin);
                    setIsAuthenticated(true);
                } else {
                    // Clear invalid stored PIN
                    localStorage.removeItem(ADMIN_PIN_KEY);
                }
                setIsVerifying(false);
            });
        } else {
            setIsVerifying(false);
        }
    }, []);

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);

        try {
            const isValid = await verifyPin(pin);

            if (isValid) {
                // Store PIN in localStorage
                localStorage.setItem(ADMIN_PIN_KEY, pin);
                setIsAuthenticated(true);
                toast.success("Access granted!");
            } else {
                toast.error("Invalid PIN");
                setPin("");
            }
        } catch (error) {
            toast.error("Verification failed");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(ADMIN_PIN_KEY);
        setIsAuthenticated(false);
        setPin("");
        toast.success("Logged out");
    };

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
        }
    }, [value]);

    // Show loading while checking stored PIN
    if (isVerifying && !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="text-sm text-muted-foreground">
                                Verifying credentials...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Admin Access</CardTitle>
                        <CardDescription>
                            Enter PIN to access admin panel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePinSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pin">PIN</Label>
                                <Input
                                    id="pin"
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="Enter admin PIN"
                                    required
                                    autoFocus
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isVerifying}
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Unlock"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-end mb-4">
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Link</CardTitle>
                        <CardDescription>
                            Create a new link in the hub
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                        setType(
                                            e.target.value as
                                                | "text"
                                                | "url"
                                                | "link",
                                        )
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="url">URL</option>
                                    <option value="text">Text</option>
                                    <option value="link">Link</option>
                                </select>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
