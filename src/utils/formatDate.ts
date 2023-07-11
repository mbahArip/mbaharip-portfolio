const formatter = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

export default function formatDate(date: Date | string | number) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return formatter.format(date);
}
