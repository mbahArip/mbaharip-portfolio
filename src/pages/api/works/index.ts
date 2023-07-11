import { NextApiRequest, NextApiResponse } from 'next';

import postNameParser from 'utils/blogNameParser';
import octokit from 'utils/octokit';
import parsePostData from 'utils/parsePostData';

import { APICache, APIResponse } from 'types/api';
import { GithubFile } from 'types/github';
import { BlogMetadata, Blogs, Post } from 'types/post';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const currentPage = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 10;
    const start = (currentPage - 1) * perPage;
    const end = currentPage * perPage;
    const query = req.query.q as string;

    const { data } = (await octokit.rest.repos.getContent({
      owner: 'mbaharip',
      path: '@db/worksIndex.json',
      repo: 'mbaharip-blog-posts',
    })) as Partial<{ data: GithubFile }>;

    if (!data) {
      throw new Error('Data is not found');
    }

    let rawContent = Buffer.from(data.content, 'base64').toString('utf-8');
    let content = (JSON.parse(rawContent) as Post[])
      .filter((post) => {
        if (!query) return true;

        const { title, tags } = post;
        if (title.toLowerCase().includes(query.toLowerCase())) return true;

        const tagsString = tags?.map((tag) => tag.replace('#', '')).join(' ');

        if (tagsString?.toLowerCase().includes(query.toLowerCase()))
          return true;

        return false;
      })
      .sort((a, b) => {
        const aDate = new Date(a.created).getTime();
        const bDate = new Date(b.created).getTime();

        return bDate - aDate;
      });

    const dataLength = content.length;
    const totalPages = Math.ceil(dataLength / perPage);

    if (currentPage > totalPages && dataLength > 0) {
      throw new Error(
        `You are tring to access page ${currentPage} but the total pages is ${totalPages}`,
      );
    }

    content = content.slice(start, end);

    const payload: APIResponse<Post[]> = {
      status: 200,
      timestamp: Date.now(),
      data: content,
      pagination: {
        currentPage,
        totalPages,
        perPage,
        start,
        end,
        isNextPage: currentPage < totalPages,
        isPrevPage: currentPage > 1,
      },
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
