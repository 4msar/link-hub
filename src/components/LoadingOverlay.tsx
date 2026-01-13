"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayContextType {
    showOverlay: () => void;
    hideOverlay: () => void;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextType | undefined>(undefined);

export function useLoadingOverlay() {
    const context = useContext(LoadingOverlayContext);
    if (!context) {
        throw new Error("useLoadingOverlay must be used within LoadingOverlayProvider");
    }
    return context;
}

export function LoadingOverlayProvider({ children }: { children: ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isSlideIn, setIsSlideIn] = useState(false);

    const showOverlay = useCallback(() => {
        setIsVisible(true);
        // Trigger slide-in animation after mount
        setTimeout(() => {
            setIsSlideIn(true);
        }, 10);
    }, []);

    const hideOverlay = useCallback(() => {
        // Trigger slide-out animation (bottom to top)
        setIsSlideIn(false);
        // Remove from DOM after animation completes
        setTimeout(() => {
            setIsVisible(false);
        }, 500); // Match animation duration
    }, []);

    return (
        <LoadingOverlayContext.Provider value={{ showOverlay, hideOverlay }}>
            {children}
            {isVisible && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-transform duration-500 ease-in-out"
                    style={{
                        transform: isSlideIn ? "translateY(0)" : "translateY(-100%)",
                    }}
                >
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                </div>
            )}
        </LoadingOverlayContext.Provider>
    );
}
