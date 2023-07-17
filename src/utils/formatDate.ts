export default function formatDate(
  date: Date | string | number,
  withDay: boolean = false,
) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  const formatter = new Intl.DateTimeFormat('en-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    weekday: withDay ? 'long' : undefined,
  });
  return formatter.format(date);
}
