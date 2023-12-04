/**
 * Replaces the state of the current URL with the given URL.
 * It using replaceState instead of pushState so that the user can't go back to the previous URL.
 * @param url URL - The URL to replace the current URL with.
 */
export default function updateURLState(url: URL) {
  if (typeof window === 'undefined') return;

  window.history.replaceState({}, '', url.href);
}
