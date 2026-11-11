"use client";

import { useSearchParams } from "next/navigation";
import { Badge } from "./ui/badge";
import Link from "next/link";

const navItems = [
    { label: "msar.me", href: "https://msar.me" },
    { label: "blog", href: "https://blog.msar.me" },
    { label: "signals", href: "/signals", sameTab: true },
    // { label: "companies", href: "/companies", sameTab: true },
    { label: "rss", href: "/feed" },
];

export const HeaderLinks = () => {
    const params = useSearchParams();

    const fromParam = params.get("from");

    return (
        <nav className="mt-4 flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
                <Badge
                    variant={fromParam === item.label ? "default" : "outline"}
                    key={item.label}
                >
                    {item.href ? (
                        <Link
                            {...(item.sameTab
                                ? {}
                                : {
                                      target: "_blank",
                                      rel: "noopener noreferrer",
                                  })}
                            href={item.href}
                        >
                            {item.label}
                        </Link>
                    ) : (
                        item.label
                    )}
                </Badge>
            ))}
        </nav>
    );
};
