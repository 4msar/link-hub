"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MouseEvent, ReactNode, useEffect } from "react";
import { useLoadingOverlay } from "./LoadingOverlay";

interface TransitionLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
}

export function TransitionLink({ href, children, className }: TransitionLinkProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { showOverlay, hideOverlay } = useLoadingOverlay();

    useEffect(() => {
        // Hide overlay when pathname changes (navigation complete)
        hideOverlay();
    }, [pathname, hideOverlay]);

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        // Don't handle if it's a modified click or same page
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || href === pathname) {
            return;
        }

        e.preventDefault();
        
        // Show the loading overlay with slide-in animation
        showOverlay();
        
        // Small delay to ensure overlay is visible before navigation
        setTimeout(() => {
            router.push(href);
        }, 100);
    };

    return (
        <Link href={href} onClick={handleClick} className={className} prefetch>
            {children}
        </Link>
    );
}
