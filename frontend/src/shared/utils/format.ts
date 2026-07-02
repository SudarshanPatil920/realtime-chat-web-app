export const formatTime = (value: string | Date) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const formatRelativeTime = (value: string | Date) => {
  const date = new Date(value);
  const now = new Date();
  const diffMinutes = Math.max(1, Math.round((now.getTime() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.round(diffMinutes / 60)}h ago`;
  return `${Math.round(diffMinutes / 1440)}d ago`;
};
