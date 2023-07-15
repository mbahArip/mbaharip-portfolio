import matter from 'gray-matter';
import { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/octokit';

import { APICache, APIResponse } from 'types/api';
import { GithubFile } from 'types/github';
import { PostDetails } from 'types/post';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }
  const { fileName }: Partial<{ fileName: string }> = req.query;

  try {
    const { data } = (await octokit.rest.repos.getContent({
      owner: 'mbaharip',
      path: `blogs/${fileName}.md`,
      repo: 'mbaharip-blog-posts',
    })) as Partial<{ data: GithubFile }>;

    if (!data) {
      throw new Error('Data is not found');
    }

    if (data.type !== 'file') {
      throw new Error('Data is not a file');
    }

    let rawContent = Buffer.from(data.content, 'base64').toString('utf-8');
    const markdownData = matter(rawContent);
    let markdownContent = markdownData.content;
    if (markdownContent.startsWith('\n')) {
      markdownContent = markdownContent.slice(1);
    }

    let tags = [];
    if (Array.isArray(markdownData.data.tags) && markdownData.data.tags[0]) {
      tags = markdownData.data.tags;
    }

    const summary = markdownContent
      .replace(/!\[\[([^\]]+)\]\]/g, '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/#+\s/g, '')
      .split('\n')
      .slice(0, 3)
      .join(' ')
      .trim();

    let thumbnail = markdownData.data.thumbnail ?? '/img/no-image.webp';
    if (/!\[\[([^\]]+)\]\]/g.test(thumbnail)) {
      thumbnail = thumbnail.match(/!\[\[([^\]]+)\]\]/)?.[1] ?? 'logo.webp';
      thumbnail = `/api/attachments/banner/${thumbnail}`;
    } else {
      thumbnail = thumbnail.replace(/"/g, '').replace(/\\/g, '');
    }

    const postData: PostDetails = {
      content: markdownContent,
      metadata: {
        title:
          markdownData.data.title ?? data.name.replace('.md', '') ?? 'Untitled',
        summary,
        thumbnail: thumbnail ?? null,
        thumbnail_x: markdownData.data.thumbnail_x ?? 0.5,
        thumbnail_y: markdownData.data.thumbnail_y ?? 0.5,
        tags,
        createdAt: markdownData.data.created ?? new Date().toISOString(),
        updatedAt: markdownData.data.updated ?? new Date().toISOString(),
      },
    };

    const payload: APIResponse<PostDetails> = {
      status: 200,
      timestamp: Date.now(),
      data: postData,
    };

    res.setHeader('Cache-Control', APICache);
    return res.status(payload.status).json(payload);
  } catch (error: any) {
    const payload: APIResponse = {
      status: error.status ?? error.code ?? 500,
      timestamp: Date.now(),
      error: {
        message: error.message,
        cause: error.cause ?? error.reason ?? 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    };

    return res.status(payload.status).json(payload);
  }
}
