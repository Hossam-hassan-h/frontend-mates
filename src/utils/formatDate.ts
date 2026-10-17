/**
 * Date formatting utilities for Arabic locale.
 */

export function formatDate(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '—';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If in future or less than 1 minute
  if (diffMs < 60 * 1000) {
    return 'Just now';
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  // Less than 60 minutes
  if (diffMinutes < 60) {
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes === 2) return '2 minutes ago';
    if (diffMinutes >= 3 && diffMinutes <= 10) return `${diffMinutes} minutes ago`;
    return `${diffMinutes} minutes ago`;
  }

  // Less than 24 hours
  if (diffHours < 24) {
    if (diffHours === 1) return '1 hour ago';
    if (diffHours === 2) return '2 hours ago';
    if (diffHours >= 3 && diffHours <= 10) return `${diffHours} hours ago`;
    return `${diffHours} hours ago`;
  }

  // Recent: Less than 7 days
  if (diffDays < 7) {
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 2) return '2 days ago';
    if (diffDays >= 3 && diffDays <= 10) return `${diffDays} days ago`;
    return `${diffDays} days ago`;
  }

  // Older: >= 7 days -> absolute date (e.g. Aug 1, 2026)
  return formatDate(date);
}

export default formatDate;
