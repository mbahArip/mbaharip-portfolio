import axios from 'axios';

// import env from './env';

/**
 * test
 * @param file
 * @param opts
 * @returns
 */

export default async function uploadFile(
  file: File,
  opts?: {
    allowedExtensions?: string[];
    uploadPath?: string;
  },
) {
  try {
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${randomId}_${file.name.replace(/\s/g, '-')}`;
    const fileExtension = file.name.split('.').pop() ?? '';
    const contentType = file.type;
    const key = `${opts?.uploadPath ?? ''}/${fileName}`.startsWith('/')
      ? `${opts?.uploadPath ?? ''}/${fileName}`.slice(1)
      : `${opts?.uploadPath ?? ''}/${fileName}`;

    if (opts?.allowedExtensions) {
      if (!opts.allowedExtensions.includes(fileExtension)) throw new Error('Invalid file type');
    }

    const payload = {
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
    };

    const formData = new FormData();
    formData.append('file', file, fileName);
    await axios.request({
      method: 'put',
      maxBodyLength: Infinity,
      url: `https://r2.mbaharip.com/${key}`,
      headers: {
        'Authorization': `Basic ${btoa(JSON.stringify(payload))}`,
        'Content-Type': contentType,
      },
      data: Buffer.from(await file.arrayBuffer()),
      withCredentials: false,
    });

    return `https://r2.mbaharip.com/${key}`;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export function getFileUploadKey(url: string) {
  const removedDomain = url.replace('https://r2.mbaharip.com/', '');
  const split = removedDomain.split('/');
  const uploadPath = split.slice(0, split.length - 1).join('/');

  return {
    path: uploadPath,
    fileName: split[split.length - 1],
  };
}
