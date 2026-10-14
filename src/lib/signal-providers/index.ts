import { SIGNAL_PROVIDER } from "@/lib/constant";
import { artifactsProvider } from "./artifacts";
import { githubProvider } from "./github";
import type { SignalProvider } from "./types";

export type { SignalFile, SignalProvider } from "./types";

const providers: Record<string, SignalProvider> = {
    artifacts: artifactsProvider,
    github: githubProvider,
};

export const getSignalProvider = (): SignalProvider => {
    const provider = providers[SIGNAL_PROVIDER];

    if (!provider) {
        throw new Error(
            `Unknown SIGNAL_PROVIDER "${SIGNAL_PROVIDER}". Use one of: ${Object.keys(providers).join(", ")}`,
        );
    }

    return provider;
};
