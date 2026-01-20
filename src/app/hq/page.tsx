"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { TransitionLink } from "@/components/TransitionLink";
import { AuthForm } from "@/components/AuthForm";
import { AddLinkForm } from "@/components/AddLinkForm";

const ADMIN_PIN_KEY = "admin_pin";

export default function AdminPage() {
    const [pin, setPin] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);

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

    const handleCacheRevalidation = async () => {
        try {
            const queryParams = new URLSearchParams({
                path: "/",
                tag: "links",
            });

            const response = await fetch(
                `/api/revalidate?${queryParams.toString()}`,
            );

            if (response.ok) {
                toast.success("Cache revalidated successfully");
            } else {
                toast.error("Failed to revalidate cache");
            }
        } catch (error) {
            toast.error("An error occurred during revalidation");
        }
    };

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
            <AuthForm
                pin={pin}
                setPin={setPin}
                isVerifying={isVerifying}
                handlePinSubmit={handlePinSubmit}
            />
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <TransitionLink
                            href="/hq"
                            className="text-2xl font-bold"
                        >
                            Admin Panel
                        </TransitionLink>
                        <span> | </span>
                        <TransitionLink href="/" className="text-2xl font-bold">
                            Home
                        </TransitionLink>
                    </div>
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
                        <AddLinkForm pin={pin} />
                    </CardContent>
                </Card>

                <div className="mt-8 flex items-center justify-center">
                    <Button
                        variant="destructive"
                        className="cursor-pointer text-white"
                        onClick={handleCacheRevalidation}
                    >
                        Revalidate Cache
                    </Button>
                </div>
            </div>
        </div>
    );
}
