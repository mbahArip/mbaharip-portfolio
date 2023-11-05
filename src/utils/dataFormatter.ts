/**
 * Formats a number to ***K or ***M format
 * @param num - The number to format
 * @returns - `string` The formatted number
 */
export function formatRelativeNumber(num: number) {
  if (num < 1000) return num;
  if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
  return `${(num / 1000000).toFixed(1)}m`;
}

/**
 * Formats a date to relative time
 * @param date - The date to format
 * @param future - If the date is in the future
 * @returns - `string` The formatted date
 */
export function formatRelativeDate(date: string, future: boolean = false) {
  const now = new Date();
  const diff = future ? new Date(date).getTime() - now.getTime() : now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let start = future ? 'in' : '';
  let ending = future ? '' : 'ago';

  if (seconds < 60) {
    return `${start} ${seconds} seconds ${ending}`;
  } else if (minutes < 60) {
    return `${start} ${minutes} minutes ${ending}`;
  } else if (hours < 24) {
    return `${start} ${hours} hours ${ending}`;
  } else if (days < 7) {
    return `${start} ${days} days ${ending}`;
  } else if (days < 30) {
    return `${start} ${Math.floor(days / 7)} weeks ${ending}`;
  } else if (days < 365) {
    return `${start} ${Math.floor(days / 30)} months ${ending}`;
  } else if (days >= 365) {
    return `${start} ${Math.floor(days / 365)} years ${ending}`;
  } else {
    return date;
  }
}

/**
 * Formats a duration in seconds to a human readable format
 * @param seconds - The duration in seconds
 * @param opts - The options for formatting
 * @returns - `string` The formatted duration
 */
export function formatDuration(
  seconds: number,
  opts: formatDurationOpts = {
    show: {
      years: false,
      months: false,
      days: true,
      hours: true,
      minutes: true,
      seconds: true,
    },
    padZeroes: false,
  },
) {
  const years = Math.floor(seconds / 31536000);
  const months = Math.floor(seconds / 2592000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const secondsLeft = Math.floor(seconds - hours * 3600 - minutes * 60);

  const showText = {
    years: opts.show.years && years > 0,
    months: opts.show.months && months > 0,
    days: opts.show.days && days > 0,
    hours: opts.show.hours && hours > 0,
    minutes: opts.show.minutes && minutes > 0,
    seconds: opts.show.seconds && secondsLeft > 0,
  };
  const show = Object.values(showText).some((val) => val);
  const padZeroes = opts.padZeroes;

  if (!show) return '0s';

  let text = '';
  if (showText.years && opts.show.years) text += `${padZeroes ? years.toString().padStart(2, '0') : years}y `;
  if (showText.months && opts.show.months) text += `${padZeroes ? months.toString().padStart(2, '0') : months}mo `;
  if (showText.days && opts.show.days) text += `${padZeroes ? days.toString().padStart(2, '0') : days}d `;
  if (showText.hours && opts.show.hours) text += `${padZeroes ? hours.toString().padStart(2, '0') : hours}h `;
  if (showText.minutes && opts.show.minutes) text += `${padZeroes ? minutes.toString().padStart(2, '0') : minutes}m `;
  if (showText.seconds && opts.show.seconds)
    text += `${padZeroes ? secondsLeft.toString().padStart(2, '0') : secondsLeft}s`;

  return text.trim();
}

type formatDurationOpts = {
  show: {
    years?: boolean;
    months?: boolean;
    days?: boolean;
    hours?: boolean;
    minutes?: boolean;
    seconds?: boolean;
  };
  padZeroes?: boolean;
};

export function formatDate(date: string | number | Date, opts: Intl.DateTimeFormatOptions = {}) {
  const d = new Date(date);
  const finalOpts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...opts,
  };

  return d.toLocaleDateString('en-US', finalOpts);
}

export function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}
