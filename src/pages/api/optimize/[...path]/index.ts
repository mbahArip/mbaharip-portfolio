import { createCanvas, loadImage } from '@napi-rs/canvas';
import { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/octokit';

import { APIResponse } from 'types/api';
import { GithubFile } from 'types/github';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { path } = req.query as { path: string[] };
    const {
      width: queryWidth,
      height: queryHeight,
      quality: queryQuality,
      scale: queryScale,
    } = req.query as {
      width: string;
      height: string;
      quality: string;
      scale: string;
    };

    let url = path.join('/');
    const isAttachments = url.startsWith('attachments');
    const isLocal = url.startsWith('local');
    // Differentiate between attachment and url
    if (isAttachments) {
      url = url.replace('attachments/', '');
    } else if (isLocal) {
      url = url.replace('local/', '');
    } else {
      url = `https://${url}`;
    }

    let canvasWidth = 256;
    let canvasHeight = 256;
    let quality = 70;

    if (queryWidth && queryHeight) {
      canvasWidth = parseInt(queryWidth);
      canvasHeight = parseInt(queryHeight);
    } else if (queryWidth || queryHeight) {
      canvasWidth = parseInt(queryWidth ?? queryHeight);
      canvasHeight = parseInt(queryWidth ?? queryHeight);
    }
    if (queryQuality) {
      const parsedQuality = parseInt(queryQuality);
      if (parsedQuality > 100 || parsedQuality < 0) {
        throw new Error('Quality must be between 0 and 100');
      }
      quality = parsedQuality;
    }

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';

    // @ts-expect-error
    let image: Image | null = null;
    let fileName = url.split('/').pop() ?? 'untitled';

    const regex = new RegExp(
      /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|bmp|webp|gif|png|svg)/g,
    );

    // If regex is attachment, else if regex is url
    if (!regex.test(url as string)) {
      // If it's attachment, get the attachment from github
      // else get from public url

      if (isLocal) {
        const localUrl = new URL(url, process.env.NEXT_PUBLIC_SITE_URL);
        const imgBuffer = await fetch(localUrl).then((res) =>
          res.arrayBuffer(),
        );

        image = await loadImage(imgBuffer);
      } else if (isAttachments) {
        let attachmentPath;
        if (url.startsWith('/')) {
          attachmentPath = `@attachments${url}`;
        } else {
          attachmentPath = `@attachments/${url}`;
        }

        const { data } = (await octokit.rest.repos.getContent({
          owner: 'mbaharip',
          path: attachmentPath,
          repo: 'mbaharip-blog-posts',
        })) as Partial<{ data: GithubFile }>;

        if (!data) {
          throw new Error('File not found');
        }

        if (data.type !== 'file') {
          throw new Error('Invalid attachment, attachment must be a file');
        }

        const imgBuffer = Buffer.from(data.content, 'base64');

        image = await loadImage(imgBuffer);
      } else {
        throw new Error('Invalid image url, URL must have image extension');
      }
    } else {
      const imgBuffer = await fetch(url as string).then((res) =>
        res.arrayBuffer(),
      );

      image = await loadImage(imgBuffer);
    }

    const { width: imageWidth, height: imageHeight } = image;

    const canvasRatio = canvasWidth / canvasHeight;
    const imageRatio = imageWidth / imageHeight;

    let scale = 1;
    if (imageRatio >= canvasRatio) {
      scale = canvasHeight / imageHeight;
    } else {
      scale = canvasWidth / imageWidth;
    }

    if (queryScale) {
      const parsedScale = parseFloat(queryScale);
      if (parsedScale > 10 || parsedScale < 0) {
        throw new Error('Scale must be between 0 and 10');
      }
      scale = parsedScale;
    }

    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    const x = canvasWidth / 2 - scaledWidth / 2;
    const y = canvasHeight / 2 - scaledHeight / 2;

    if (queryScale) {
      // if scale, set the canvas size to the scaled image size
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    } else {
      ctx.drawImage(
        image,
        0,
        0,
        imageWidth,
        imageHeight,
        x,
        y,
        scaledWidth,
        scaledHeight,
      );
    }

    const buffer = canvas.toBuffer('image/webp', quality);

    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
    );
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `inline; filename=${fileName}`);

    return res.status(200).send(buffer);
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
