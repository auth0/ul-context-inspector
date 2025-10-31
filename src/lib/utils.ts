import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Sort semantic-like version strings (e.g., v1.2.3) in descending order.
export function sortDescVersions(input: string[]): string[] {
  return [...input].sort((a, b) => {
    const aParts = a.replace(/^v/, "").split(".").map(Number);
    const bParts = b.replace(/^v/, "").split(".").map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const av = aParts[i] ?? 0;
      const bv = bParts[i] ?? 0;
      if (av !== bv) return bv - av; // descending
    }
    return 0;
  });
}
