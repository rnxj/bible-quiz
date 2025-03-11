/**
 * Format a timestamp into a readable date string
 * @param timestamp Unix timestamp in milliseconds
 * @param format The format to use: 'short', 'long', or 'relative'
 * @returns Formatted date string
 */
export function formatDate(
  timestamp: number,
  format: "short" | "long" | "relative" = "short",
): string {
  const date = new Date(timestamp);

  if (format === "relative") {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than a minute
    if (diffInSeconds < 60) {
      return "just now";
    }

    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    // Default to short format for older dates
    return date.toLocaleDateString();
  }

  if (format === "short") {
    return date.toLocaleDateString();
  }

  return date.toLocaleString();
}
