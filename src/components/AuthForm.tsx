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
import Link from "next/link";
import { TransitionLink } from "@/components/TransitionLink";

const ADMIN_PIN_KEY = "admin_pin";

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
                                type="number"
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
