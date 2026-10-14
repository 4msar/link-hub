"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
    ArrowUpRight,
    Home,
    Link2,
    Loader2,
    LogOut,
    Plus,
    Radio,
    Trash2,
} from "lucide-react";
import { TransitionLink } from "@/components/TransitionLink";
import { AuthForm, AuthShell } from "@/components/AuthForm";
import { AddLinkForm } from "@/components/AddLinkForm";

const ADMIN_PIN_KEY = "admin_pin";

const QUICK_LINKS = [
    { label: "Home", description: "View the public link hub", href: "/", icon: Home },
    { label: "Signals", description: "Browse signal files", href: "/signals", icon: Radio },
];

export default function AdminPage() {
    const [pin, setPin] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isClearingCache, setIsClearingCache] = useState(false);

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

    const handleClearCache = async () => {
        setIsClearingCache(true);
        try {
            const response = await fetch("/api/revalidate?all=true");

            if (response.ok) {
                toast.success("All cache cleared");
            } else {
                toast.error("Failed to clear cache");
            }
        } catch (error) {
            toast.error("An error occurred while clearing cache");
        } finally {
            setIsClearingCache(false);
        }
    };

    // Show loading while checking stored PIN
    if (isVerifying && !isAuthenticated) {
        return (
            <AuthShell>
                <div className="flex flex-col items-center gap-4 py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Verifying credentials...
                    </p>
                </div>
            </AuthShell>
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
        <div className="min-h-dvh bg-muted/40">
            {/* Top bar */}
            <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="mx-auto flex h-14 sm:h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
                    <TransitionLink
                        href="/hq"
                        className="flex items-center gap-2.5 min-w-0"
                    >
                        <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
                            <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                        </span>
                        <span className="truncate font-bold tracking-tight sm:text-lg">
                            Admin Panel
                        </span>
                    </TransitionLink>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="hidden sm:inline-flex"
                        >
                            <TransitionLink href="/">
                                <Home />
                                Home
                            </TransitionLink>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            aria-label="Logout"
                        >
                            <LogOut />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Add new links to the hub and manage the site.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Add link */}
                    <section className="lg:col-span-2 rounded-2xl border bg-card text-card-foreground shadow-sm">
                        <div className="flex items-center gap-3 border-b px-5 py-4 sm:px-6">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                <Plus className="h-4 w-4" />
                            </span>
                            <div>
                                <h2 className="font-semibold leading-tight">
                                    Add New Link
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Create a new link in the hub
                                </p>
                            </div>
                        </div>
                        <div className="p-5 sm:p-6">
                            <AddLinkForm pin={pin} />
                        </div>
                    </section>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <section className="rounded-2xl border bg-card text-card-foreground shadow-sm">
                            <h2 className="px-5 pt-4 pb-2 text-sm font-semibold text-muted-foreground">
                                Quick links
                            </h2>
                            <ul className="p-2 pt-0">
                                {QUICK_LINKS.map(
                                    ({ label, description, href, icon: Icon }) => (
                                        <li key={href}>
                                            <TransitionLink
                                                href={href}
                                                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted"
                                            >
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-sm font-medium">
                                                        {label}
                                                    </span>
                                                    <span className="block truncate text-xs text-muted-foreground">
                                                        {description}
                                                    </span>
                                                </span>
                                                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                            </TransitionLink>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </section>

                        <section className="rounded-2xl border border-destructive/30 bg-card text-card-foreground shadow-sm p-5">
                            <h2 className="font-semibold">Danger zone</h2>
                            <p className="text-sm text-muted-foreground mt-1 mb-4">
                                Clear every cached response. Pages will be
                                rebuilt on the next request.
                            </p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="w-full cursor-pointer text-white"
                                        disabled={isClearingCache}
                                    >
                                        {isClearingCache ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <Trash2 />
                                        )}
                                        Clear All Cache
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Clear all cache?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            All cached data will be
                                            invalidated. The next visitors may
                                            see slower load times while it is
                                            rebuilt.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleClearCache}
                                            className="bg-destructive text-white hover:bg-destructive/90"
                                        >
                                            Clear cache
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
}
