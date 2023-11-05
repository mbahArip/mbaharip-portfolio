/**
 * Since all the images will be uploaded to discord, I could use the discord media proxy to resize the images on the fly.
 * @param url - The url of the image
 * @param opts - Object of width and height (default to 256x256)
 * @returns The optimized image url with webp format
 */

export default function getOptimizedImage(
  url: string,
  { width, height }: Record<'width' | 'height', number> = { width: 256, height: 256 },
) {
  if (!url.includes('cdn.discordapp.com') && !url.includes('media.discordapp.net')) return url;

  const parsedUrl = new URL(url);
  parsedUrl.hostname = 'media.discordapp.net';
  parsedUrl.search = '';
  parsedUrl.searchParams.append('width', String(width));
  parsedUrl.searchParams.append('height', String(height));
  parsedUrl.searchParams.append('format', 'webp');

  return parsedUrl.toString();
}
