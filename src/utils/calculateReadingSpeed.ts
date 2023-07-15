// Create a function that accepts a text and wpm number (default is 180) and returns the estimated reading time based on the text and wpm.
// example: if it's under a minutes, it will return 'Around a minute read'
// example2: if it's more than a minutes, it will return 'Around 2 minutes read' (plural)
// example3: if it's more than 1 hour, it will return 'Around 1 hour read' (singular)

export default function calculateReadingSpeed(text: string, wpm: number = 180) {
  const words = text.split(' ').length;
  const minutes = Math.floor(words / wpm);
  const seconds = ((words % wpm) * 60) / wpm;

  const roundedMinutes = Math.ceil(seconds / 60);
  const plural = roundedMinutes > 1 ? 's' : '';

  if (minutes < 1) {
    return `Around a minute read`;
  } else if (minutes < 60) {
    return `Around ${minutes} minutes${plural} read`;
  } else {
    return `Around ${minutes} hour${plural} read`;
  }
}
