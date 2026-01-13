"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MouseEvent, ReactNode, useRef, startTransition } from "react";

interface TransitionLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
}

export function TransitionLink({ href, children, className }: TransitionLinkProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        // Don't handle if it's a modified click or same page
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || href === pathname) {
            return;
        }

        // Check if the browser supports View Transitions API
        if (typeof document !== 'undefined' && 'startViewTransition' in document) {
            e.preventDefault();
            
            (document as any).startViewTransition(() => {
                // Use React's startTransition to avoid showing loading state
                startTransition(() => {
                    router.push(href);
                });
            });
        }
        // For browsers without View Transitions, let Next.js Link handle it naturally
    };

    return (
        <Link href={href} onClick={handleClick} className={className} prefetch>
            {children}
        </Link>
    );
}
