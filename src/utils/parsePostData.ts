import { GithubFile } from 'types/github';
import { Blog, BlogMetadata } from 'types/post';

type Return = {};

export default function parsePostData(data: GithubFile): Blog {
  let markdown = Buffer.from(data.content, 'base64').toString('utf-8');
  const frontMatter = markdown.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
  markdown = markdown.replace(/^---\n([\s\S]*?)\n---\n/, '');

  const rawFm: {
    title: string;
    created: string | number | Date;
    updated: string | number | Date;
    banner: string;
    tags?: string;
  } = frontMatter
    .split('\n')
    .map((line) => line.split(': '))
    .reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: value,
      };
    }, {}) as any;

  const fm: BlogMetadata = {
    title: rawFm.title ?? '',
    description: processDescription(markdown ?? ''),
    banner: processBanner(rawFm.banner ?? ''),
    tags: processTags(rawFm.tags ?? ''),
    created: new Date(rawFm.created),
    updated: new Date(rawFm.updated),
  };

  return {
    content: markdown,
    metadata: fm,
  };
}

function processDescription(markdown: string): string {
  const DESC_LENGTH: number = 150;

  return markdown
    .replace(/!\[\[([^\]]+)\]\]/g, '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/#+\s/g, '')
    .replace(/\n/g, ' ')
    .substring(0, DESC_LENGTH)
    .trim()
    .concat(markdown.length > DESC_LENGTH ? '...' : '');
}

function processBanner(fmBanner: string): string {
  if (!fmBanner) return '/api/attachments/no-banner.webp';
  let url = '';
  if (/!\[\[([^\]]+)\]\]/g.test(fmBanner)) {
    url = fmBanner.match(/!\[\[([^\]]+)\]\]/)?.[1] ?? 'logo.webp';
    url = `/api/attachments/banner/${url}`;
  } else {
    url = fmBanner.replace(/"/g, '').replace(/\\/g, '');
  }

  return url;
}

function processTags(fmTags: string): string[] {
  if (!fmTags) return [];
  return fmTags.split(' ').map((tag) => tag.trim());
}
