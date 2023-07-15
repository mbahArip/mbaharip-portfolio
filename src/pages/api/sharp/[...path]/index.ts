import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

import { APIResponse } from 'types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { path } = req.query as { path: string[] };
    const { width, height, quality } = req.query as {
      width: string;
      height: string;
      quality: string;
    };

    const urlQuery = path.join('/');
    let type: 'attachments' | 'local' | 'url';
    if (urlQuery.startsWith('@attachments')) {
      type = 'attachments';
    } else if (urlQuery.startsWith('@local')) {
      type = 'local';
    } else if (urlQuery.startsWith('@url')) {
      type = 'url';
    } else {
      throw new Error(
        'Invalid path. Path must be start with @attachments, @local, or @url',
      );
    }

    let imgBuffer: Buffer | ArrayBuffer | undefined;
    if (type === 'attachments') {
      const attachmentUrl = new URL(
        `/mbahArip/mbaharip-blog-posts/master/${urlQuery}`,
        'https://raw.githubusercontent.com',
      );
      imgBuffer = await fetch(attachmentUrl).then((res) => res.arrayBuffer());
    } else if (type === 'local') {
      const localUrl = new URL(
        urlQuery.replace('@local/', ''),
        process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      );
      imgBuffer = await fetch(localUrl).then((res) => res.arrayBuffer());
    } else if (type === 'url') {
      const externalUrl = new URL(urlQuery.replace('@url/', 'https://'));
      imgBuffer = await fetch(externalUrl).then((res) => res.arrayBuffer());
    }

    const shrp = await sharp(imgBuffer)
      .resize({
        width: parseInt(width) || undefined,
        height: parseInt(height) || undefined,
        fit: 'cover',
        position: 'center',
      })
      .webp({
        quality: parseInt(quality) || 70,
      })
      .toBuffer();

    const fileName = `${path[path.length - 1]}.webp`;

    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
    );
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Content-Length', shrp.length);
    res.setHeader('Content-Disposition', `inline; filename=${fileName}`);

    return res.status(200).send(shrp);
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
