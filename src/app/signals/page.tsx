import { SignalFileMenu } from "@/components/SignalFileMenu";
import { getSignalFiles, getSignalUrl } from "@/lib/signals";

export const revalidate = 86400;

type SignalsPageProps = {
    searchParams: Promise<{ file?: string }>;
};

export default async function SignalsPage({ searchParams }: SignalsPageProps) {
    const [files, params] = await Promise.all([getSignalFiles(), searchParams]);
    const selectedFile =
        files.find((file) => file.name === params.file) ?? files[0];

    return (
        <main className="flex h-screen flex-col overflow-hidden bg-background">
            <header className="flex h-8 shrink-0 items-center justify-center border-b border-border bg-background px-4">
                <SignalFileMenu
                    files={files}
                    selectedFile={selectedFile.name}
                />
            </header>
            <iframe
                title={selectedFile.name}
                src={getSignalUrl(selectedFile.name)}
                className="min-h-0 w-full flex-1 border-0"
            />
        </main>
    );
}
