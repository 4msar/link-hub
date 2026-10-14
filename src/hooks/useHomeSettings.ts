"use client";

import { useCallback, useSyncExternalStore } from "react";

export type LoadMode = "infinite" | "button";

export interface HomeSettings {
    loadMode: LoadMode;
}

const STORAGE_KEY = "pockets:home-settings";
const CHANGE_EVENT = "pockets:home-settings-change";

export const DEFAULT_HOME_SETTINGS: HomeSettings = {
    loadMode: "infinite",
};

let cachedRaw: string | null | undefined;
let cachedSettings: HomeSettings = DEFAULT_HOME_SETTINGS;

const readSettings = (): HomeSettings => {
    let raw: string | null = null;
    try {
        raw = localStorage.getItem(STORAGE_KEY);
    } catch {
        return DEFAULT_HOME_SETTINGS;
    }

    // Return a stable reference while the stored value is unchanged
    if (raw === cachedRaw) return cachedSettings;
    cachedRaw = raw;

    try {
        const parsed = raw ? JSON.parse(raw) : {};
        cachedSettings = {
            loadMode:
                parsed.loadMode === "button" || parsed.loadMode === "infinite"
                    ? parsed.loadMode
                    : DEFAULT_HOME_SETTINGS.loadMode,
        };
    } catch {
        cachedSettings = DEFAULT_HOME_SETTINGS;
    }
    return cachedSettings;
};

const subscribe = (callback: () => void) => {
    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) callback();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(CHANGE_EVENT, callback);
    return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(CHANGE_EVENT, callback);
    };
};

export const useHomeSettings = () => {
    const settings = useSyncExternalStore(
        subscribe,
        readSettings,
        () => DEFAULT_HOME_SETTINGS,
    );

    const updateSettings = useCallback((patch: Partial<HomeSettings>) => {
        const next = { ...readSettings(), ...patch };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
            // Storage unavailable (private mode, blocked); ignore
        }
        window.dispatchEvent(new Event(CHANGE_EVENT));
    }, []);

    return { settings, updateSettings };
};
