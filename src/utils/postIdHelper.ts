/**
 * Creates a post id from the title and id
 * @param id - The id of the post
 * @param title - The title of the post
 * @returns - `string` The post id
 */
export function createPostId(id: string, title: string): string {
  const formattedTitle = title
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  return `${formattedTitle}.${id}`;
}

/**
 * Gets the post id and title from the slug
 * @param slug - The slug of the post (ex: `my-post-title.123`)
 * @returns - `object` The post id and title
 */
export function getPostId(slug: string): { id: string; title: string } {
  const [title, id] = slug.split('.');
  return {
    id,
    title,
  };
}
