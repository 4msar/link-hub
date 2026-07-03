"use client";

import { addRefToLink, cn } from "@/lib/utils";
import { useSyncExternalStore } from "react";

export const RefLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const resolvedHref = useSyncExternalStore(
    () => () => {},
    () => addRefToLink(href),
    () => href,
  );

  return (
    <a
      href={resolvedHref}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className)}
    >
      {children}
    </a>
  );
};
