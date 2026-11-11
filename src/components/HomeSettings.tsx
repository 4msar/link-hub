"use client";

import {
    Infinity as InfinityIcon,
    ListPlus,
    Monitor,
    Moon,
    Settings2,
    Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LoadMode, useHomeSettings } from "@/hooks/useHomeSettings";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const themeOptions: {
    value: "system" | "light" | "dark";
    label: string;
    icon: typeof Sun;
}[] = [
    { value: "system", label: "System", icon: Monitor },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
];

const loadModeOptions: {
    value: LoadMode;
    label: string;
    description: string;
    icon: typeof ListPlus;
}[] = [
    {
        value: "infinite",
        label: "Infinite scroll",
        description: "Load more items as you reach the bottom.",
        icon: InfinityIcon,
    },
    {
        value: "button",
        label: "Load more button",
        description: "Load the next page only when you click.",
        icon: ListPlus,
    },
];

export const HomeSettings = () => {
    const { settings, updateSettings } = useHomeSettings();
    const { theme, setTheme } = useTheme();

    return (
        <Popover>
            {/* The popover trigger must be the button itself: TooltipTitle does
                not forward the trigger props, so the click would never reach it. */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            aria-label="Display settings"
                            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Settings2 className="size-4" />
                        </button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Open display settings</p>
                </TooltipContent>
            </Tooltip>
            <PopoverContent align="end" className="w-80 rounded-xl p-0">
                <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-bold text-foreground">
                        Display settings
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Saved in this browser.
                    </p>
                </div>
                <div className="p-3">
                    <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Appearance
                    </p>
                    <div
                        role="radiogroup"
                        aria-label="Color theme"
                        className="mb-4 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
                    >
                        {themeOptions.map(({ value, label, icon: Icon }) => {
                            const active = (theme ?? "system") === value;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => setTheme(value)}
                                    className={cn(
                                        "flex h-9 items-center justify-center gap-2 rounded-md text-sm font-medium transition-all",
                                        active
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <Icon className="size-4" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Loading items
                    </p>
                    <RadioGroup
                        value={settings.loadMode}
                        onValueChange={(value) =>
                            updateSettings({ loadMode: value as LoadMode })
                        }
                        className="gap-1.5"
                    >
                        {loadModeOptions.map((option) => {
                            const Icon = option.icon;
                            const active = settings.loadMode === option.value;
                            return (
                                <Label
                                    key={option.value}
                                    htmlFor={`load-mode-${option.value}`}
                                    className={cn(
                                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                                        active
                                            ? "border-primary/40 bg-secondary"
                                            : "border-transparent hover:bg-secondary/60",
                                    )}
                                >
                                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <span className="flex-1">
                                        <span className="block text-sm font-semibold text-foreground">
                                            {option.label}
                                        </span>
                                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                            {option.description}
                                        </span>
                                    </span>
                                    <RadioGroupItem
                                        id={`load-mode-${option.value}`}
                                        value={option.value}
                                        className="mt-0.5"
                                    />
                                </Label>
                            );
                        })}
                    </RadioGroup>
                </div>
            </PopoverContent>
        </Popover>
    );
};
