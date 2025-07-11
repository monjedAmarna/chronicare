import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get user display name with fallbacks
export function getUserDisplayName(user: { name?: string; email?: string } | null | undefined): string {
  if (!user) return "Unknown User";
  if (user.name) return user.name;
  if (user.email) return user.email;
  return "Unknown User";
}

// Utility function to get user initials for avatar
export function getUserInitials(user: { name?: string; email?: string } | null | undefined): string {
  if (!user) return "U";
  if (user.name) {
    const parts = user.name.split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (user.email) return user.email[0]?.toUpperCase() || "U";
  return "U";
}
