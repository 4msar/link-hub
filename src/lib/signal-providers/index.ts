import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { CACHE_TAGS, SIGNAL_CACHE_TTL, SIGNAL_PROVIDER } from "@/lib/constant";
import { artifactsProvider } from "./artifacts";
import { githubProvider } from "./github";
import type { SignalFile, SignalProvider } from "./types";

export type { SignalFile, SignalProvider } from "./types";

const providers: Record<string, SignalProvider> = {
    artifacts: artifactsProvider,
    github: githubProvider,
};

const SIGNAL_CACHE_LIFE = {
    revalidate: SIGNAL_CACHE_TTL,
    expire: SIGNAL_CACHE_TTL * 7,
};

// Each provider result is cached for a day as a single entry, so a listing
// and any per-file lookups behind it cost no upstream requests until it is
// revalidated or the "signals" tag is cleared. Failures throw and are never
// cached. Arguments are part of the cache key, so the provider is passed by
// name rather than captured.
const cachedListFiles = async (
    providerName: string,
    path?: string,
): Promise<SignalFile[]> => {
    "use cache";
    cacheLife(SIGNAL_CACHE_LIFE);
    cacheTag(CACHE_TAGS.signals);

    return providers[providerName].listFiles(path);
};

const cachedGetFile = async (
    providerName: string,
    path: string,
): Promise<string> => {
    "use cache";
    cacheLife(SIGNAL_CACHE_LIFE);
    cacheTag(CACHE_TAGS.signals);

    return providers[providerName].getFile(path);
};

// React's cache() also dedupes calls within one render (e.g. the page and
// its generateMetadata both listing files before the cache fills).
const listFiles = cache(cachedListFiles);
const getFile = cache(cachedGetFile);

export const getSignalProvider = (): SignalProvider => {
    const provider = providers[SIGNAL_PROVIDER];

    if (!provider) {
        throw new Error(
            `Unknown SIGNAL_PROVIDER "${SIGNAL_PROVIDER}". Use one of: ${Object.keys(providers).join(", ")}`,
        );
    }

    return {
        ...provider,
        listFiles: (path) => listFiles(provider.name, path),
        getFile: (path) => getFile(provider.name, path),
    };
};
