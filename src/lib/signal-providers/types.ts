export type SignalFile = {
    name: string;
    uploaded: string;
};

export type SignalProvider = {
    name: string;
    /** List files in the root, or in `path` when given. Newest first. */
    listFiles: (path?: string) => Promise<SignalFile[]>;
    /** Fetch a file's raw contents, `path` is relative to the root. */
    getFile: (path: string) => Promise<string>;
    /** URL a browser can load (e.g. in an iframe) to render a signal file. */
    getPublicUrl: (name: string) => string;
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

export const sortByUploadedDesc = (files: SignalFile[]): SignalFile[] =>
    files.sort(
        (left, right) => Date.parse(right.uploaded) - Date.parse(left.uploaded),
    );

export const encodePath = (path: string): string =>
    path.split("/").map(encodeURIComponent).join("/");
