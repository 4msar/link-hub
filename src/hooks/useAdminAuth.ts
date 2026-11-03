"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

const ADMIN_PIN_KEY = "admin_pin";

const verifyPin = async (pinToVerify: string) => {
    try {
        const response = await fetch("/api/admin/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin: pinToVerify }),
        });

        return response.ok;
    } catch {
        return false;
    }
};

// Shared PIN gate for the /hq pages; the PIN is kept in localStorage
export const useAdminAuth = () => {
    const [pin, setPin] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);

    // Check for stored PIN on mount
    useEffect(() => {
        const storedPin = localStorage.getItem(ADMIN_PIN_KEY);
        const check = storedPin ? verifyPin(storedPin) : Promise.resolve(false);

        check.then((isValid) => {
            if (storedPin && isValid) {
                setPin(storedPin);
                setIsAuthenticated(true);
            } else if (storedPin) {
                // Clear invalid stored PIN
                localStorage.removeItem(ADMIN_PIN_KEY);
            }
            setIsVerifying(false);
        });
    }, []);

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);

        try {
            if (await verifyPin(pin)) {
                localStorage.setItem(ADMIN_PIN_KEY, pin);
                setIsAuthenticated(true);
                toast.success("Access granted!");
            } else {
                toast.error("Invalid PIN");
                setPin("");
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(ADMIN_PIN_KEY);
        setIsAuthenticated(false);
        setPin("");
        toast.success("Logged out");
    };

    return {
        pin,
        setPin,
        isAuthenticated,
        isVerifying,
        handlePinSubmit,
        logout,
    };
};
