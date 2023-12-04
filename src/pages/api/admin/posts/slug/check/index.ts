import { NextApiRequest, NextApiResponse } from 'next';

import supabaseClient from 'utils/client/supabase.client';

import { ApiResponseError, ApiResponseSuccess } from 'types/Common';
import { DbSchemaPost } from 'types/Supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseSuccess<DbSchemaPost[]> | ApiResponseError>,
) {
  const { method } = req;

  try {
    if (method !== 'GET') {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ message: 'Unauthorized', error: 'No token provided' });
      if (auth !== process.env.NEXT_PUBLIC_ADMIN_EMAIL)
        return res.status(401).json({ message: 'Unauthorized', error: 'Invalid token' });
    }

    switch (method) {
      case 'GET':
        return await GET(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    return res
      .status(isNaN(Number(error.code)) ? 500 : error.code)
      .json({ message: error.message, error: error.detail });
  }
}

// Get all posts
async function GET(req: NextApiRequest, res: NextApiResponse<ApiResponseSuccess<DbSchemaPost[]> | ApiResponseError>) {
  const { slug } = req.query as { slug: string };
  if (!slug) return res.status(400).json({ message: 'Slug is required' });

  const isExists = await supabaseClient
    .from('posts')
    .select('id', {
      head: true,
      count: 'exact',
    })
    .eq('slug', slug);
  if (isExists.count === 0) return res.status(200).json({ message: 'Slug available' });
  else return res.status(400).json({ message: 'Slug already exists' });
}
