"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { TransitionLink } from "@/components/TransitionLink";

export function AuthForm({
    pin,
    setPin,
    isVerifying,
    handlePinSubmit,
}: {
    pin: string;
    setPin: (pin: string) => void;
    isVerifying: boolean;
    handlePinSubmit: (e: React.FormEvent) => void;
}) {
    const [showPin, setShowPin] = useState(false);

    return (
        <AuthShell>
            <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                    <Lock className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Admin Access
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Enter your PIN to unlock the admin panel
                </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="pin">PIN</Label>
                    <div className="relative">
                        <Input
                            id="pin"
                            type={showPin ? "text" : "password"}
                            inputMode="numeric"
                            autoComplete="current-password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="••••••"
                            className="h-11 pr-11 text-base tracking-widest"
                            required
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowPin((v) => !v)}
                            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showPin ? "Hide PIN" : "Show PIN"}
                        >
                            {showPin ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
                <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={isVerifying || !pin}
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        "Unlock"
                    )}
                </Button>
            </form>
        </AuthShell>
    );
}

// Shared centered layout for the PIN screen and the initial verification state
export function AuthShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 bg-linear-to-b from-muted/60 to-background">
            <div className="w-full max-w-sm rounded-2xl border bg-card text-card-foreground shadow-xl shadow-black/5 p-6 sm:p-8">
                {children}
            </div>
            <TransitionLink
                href="/"
                className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                ← Back to home
            </TransitionLink>
        </div>
    );
}
