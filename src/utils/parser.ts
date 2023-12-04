import { DbSchemaAttachment } from 'types/Supabase';

export function parseMediaUrl(attachment: Partial<DbSchemaAttachment>): string {
  if (!attachment.path)
    throw {
      name: 'NoAttachmentPath',
      message: 'Cannot parse media url, attachment path is not found.',
      hint: 'The attachment should have a path.',
    };

  return `/media/${attachment.path}`.replaceAll(/\/+/g, '/');
}

export function createPostUrl(title: string, id: string): string {
  const safeTitle = title
    .replaceAll(/[^a-zA-Z0-9 ]/g, '')
    .replaceAll(' ', '-')
    .toLowerCase();
  return `${safeTitle}.${id}`;
}
export function parsePostUrl(slug: string): { title: string; id: string } {
  if (!slug || !slug.includes('.'))
    throw {
      name: 'InvalidSlug',
      message: 'Invalid slug format, please recheck the slug.',
      hint: 'The slug should be in the format of: [title].[uuid].',
    };

  const [title, id] = slug.split('.');
  return { title, id };
}
