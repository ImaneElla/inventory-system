/**
 * Formats a date into a human-readable relative time string.
 * - If isOnline is true: returns "Active now"
 * - If lastSeen is null/undefined: returns "Last seen: Unknown"
 * - Otherwise computes the difference from now and returns e.g.
 *   "Active now", "Last seen 3 minutes ago", "Last seen 4 hours ago",
 *   "Last seen 2 days ago", "Last seen Jan 12, 2026"
 */
export function formatRelativeTime(
  lastSeen: string | null | undefined,
  isOnline?: boolean
): string {
  if (isOnline) return "Active now";
  if (!lastSeen) return "Last seen: Unknown";

  const now = new Date();
  const then = new Date(lastSeen);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Active now";
  if (diffMinutes < 60) return `Last seen ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `Last seen ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `Last seen ${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  // For older dates, show the actual date
  return `Last seen ${then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}
