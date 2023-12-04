export default function parseMediaUrl(path: string, name: string) {
  // The path is already a url to the media.
  // So we just need to add /media to the path.
  return `/media/${path}`.replaceAll(/\/+/g, '/');
}
