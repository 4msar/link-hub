import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const addRefToLink = (link: string) => {
  if (typeof window === "undefined") {
    return link;
  }

  const url = new URL(link);
  const currentHost = window.location.host;
  url.searchParams.set("ref", currentHost);
  return url.toString();
}