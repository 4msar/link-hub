"use client";

import { useSearchParams } from "next/navigation";
import { Badge } from "./ui/badge";

const navItems = [
    { label: "msar.me", href: "https://msar.me" },
    { label: "blog", href: "https://blog.msar.me" },
    { label: "github", href: "https://github.com/4msar" },
];

export const HeaderLinks = () => {
    const params = useSearchParams();

    const fromParam = params.get("from");

    return (
        <nav className="mt-4 flex items-center justify-center gap-2">
            {navItems.map((item) => (
                <Badge
                    variant={fromParam === item.label ? "default" : "outline"}
                    key={item.label}
                >
                    {item.href ? (
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={item.href}
                        >
                            {item.label}
                        </a>
                    ) : (
                        item.label
                    )}
                </Badge>
            ))}
        </nav>
    );
};
