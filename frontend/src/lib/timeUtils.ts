export function formatRelativeTime(
  lastSeen: string | null | undefined,
  isOnline?: boolean
): string {
  // 1. If the user is currently online, immediately return "Active now"
  if (isOnline) return "Active now";

  // 2. If lastSeen is missing, show pure "Offline" with no time context
  if (!lastSeen) return "Offline";

  const now = new Date();
  const then = new Date(lastSeen);

  // If the date format is corrupted or invalid, safely return "Offline"
  if (isNaN(then.getTime())) return "Offline";

  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  // If the time difference is less than a minute, count as active now
  if (diffSeconds < 60) return "Active now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Build granular offline label: "Offline · Xd Yh Zm ago"
  const parts: string[] = [];
  if (diffDays > 0) parts.push(`${diffDays}d`);
  if (diffHours % 24 > 0) parts.push(`${diffHours % 24}h`);
  if (diffMinutes % 60 > 0) parts.push(`${diffMinutes % 60}m`);

  const timeAgo = parts.join(" ");

  // For dates older than 7 days, show the exact date instead of a time diff
  if (diffDays >= 7) {
    const dateLabel = then.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `Offline · since ${dateLabel}`;
  }

  return `Offline · ${timeAgo} ago`;
}