import axios from 'axios';

export default async function uploadFile(
  file: File,
  opts?: {
    allowedExtensions?: string[];
  },
) {
  try {
    const discordWebhooks = process.env.NEXT_PUBLIC_DISCORD_WEBHOOKS?.split('::') ?? [];
    if (!discordWebhooks) throw new Error('Missing discord webhook url');

    // Pick random webhook
    const randomWebhook = discordWebhooks[Math.floor(Math.random() * discordWebhooks.length)];

    // Generate random name
    const randomName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() ?? '';
    // Check if file extension is allowed (if allowedExtensions is provided)
    if (opts?.allowedExtensions) {
      if (!opts.allowedExtensions.includes(fileExtension)) throw new Error('Invalid file type');
    }

    // Check if file size is too large
    const maxFileSize = 1024 * 1024 * 25;
    if (file.size > maxFileSize) throw new Error('File size too large, max 25MB');

    // Upload file to discord
    const formData = new FormData();
    formData.append('file', file, file.name ?? `${randomName}.${fileExtension}`);
    const request = await axios.post(randomWebhook + '?wait=true', formData);
    const response = request.data;
    const url = response.attachments[0].url;

    // Return url
    return url;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
