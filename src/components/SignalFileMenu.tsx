"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SignalFile } from "@/lib/signals";

type SignalFileMenuProps = {
    files: SignalFile[];
    selectedFile: string;
};

export function SignalFileMenu({ files, selectedFile }: SignalFileMenuProps) {
    const router = useRouter();

    const selectFile = (name: string) => {
        router.push(`/signals?file=${encodeURIComponent(name)}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="inline-flex max-w-[calc(100vw-2rem)] items-center gap-2 truncate rounded-md px-2 py-1 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Choose an inbox signal"
                >
                    <span className="truncate">{selectedFile}</span>
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
                <DropdownMenuRadioGroup
                    value={selectedFile}
                    onValueChange={selectFile}
                >
                    {files.map((file) => (
                        <DropdownMenuRadioItem
                            key={file.name}
                            value={file.name}
                        >
                            {file.name}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
