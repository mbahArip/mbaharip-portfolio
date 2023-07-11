import { NextApiRequest, NextApiResponse } from 'next';

import postNameParser from 'utils/blogNameParser';
import octokit from 'utils/octokit';
import parsePostData from 'utils/parsePostData';

import { APICache, APIResponse } from 'types/api';
import { GithubFile } from 'types/github';
import { Blog, BlogMetadata, Blogs, PostDetails } from 'types/post';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }
  const { name }: Partial<{ name: string }> = req.query;

  try {
    const { data } = (await octokit.rest.repos.getContent({
      owner: 'mbaharip',
      path: `works/${name}.md`,
      repo: 'mbaharip-blog-posts',
    })) as Partial<{ data: GithubFile }>;

    if (data && data.type !== 'file') {
      throw new Error('Data is not a file');
    }

    const parsedFile = parsePostData(data as GithubFile);

    const payload: APIResponse<PostDetails> = {
      status: 200,
      timestamp: Date.now(),
      data: {
        title: parsedFile.metadata.title,
        description: parsedFile.metadata.description,
        banner: parsedFile.metadata.banner,
        tags: parsedFile.metadata.tags,
        content: parsedFile.content,
        created: parsedFile.metadata.created,
        updated: parsedFile.metadata.updated,
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
