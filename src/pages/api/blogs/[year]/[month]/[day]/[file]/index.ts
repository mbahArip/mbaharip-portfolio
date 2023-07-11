import { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/octokit';
import parsePostData from 'utils/parsePostData';

import { APICache, APIResponse } from 'types/api';
import { GithubFile } from 'types/github';
import { Blog, BlogMetadata, PostDetails } from 'types/post';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }
  const {
    file,
    year,
    month,
    day,
  }: Partial<{ file: string; year: string; month: string; day: string }> =
    req.query;

  try {
    // year/month/day/hourminutesecond_file.md
    const [time, filename] = (file as string).split('_');
    const hour = time.substring(0, 2);
    const minute = time.substring(2, 4);
    const second = time.substring(4, 6);

    const fileName = `${year}-${month}-${day}_${hour}-${minute}-${second}__${filename}.md`;

    const { data } = (await octokit.rest.repos.getContent({
      owner: 'mbaharip',
      path: `posts/${fileName}`,
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
