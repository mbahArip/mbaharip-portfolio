import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';

import supabaseServer from 'utils/client/supabase.server';

import { ApiResponseSuccess } from 'types/Common';
import { DbSchemaComment } from 'types/Supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
      // case 'POST':
      //   return await POST(req, res);
      // case 'DELETE':
      //   return await DELETE(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    return res
      .status(isNaN(Number(error.code)) ? 500 : error.code)
      .json({ message: error.message, error: error.detail });
  }
}

async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { parentId } = req.query as Record<'parentId', string>;
  if (!parentId) return res.status(400).json({ message: 'Bad request', error: 'Missing parentId' });

  const buildFetch = await supabaseServer
    .from('comments')
    .select('*, reports(count)', { count: 'exact' })
    .or(`id.eq.${parentId},parent_id.eq.${parentId}`)
    .order('created_at', { ascending: true })
    .range(0, 1000); // Set to 1000 to avoid pagination
  if (buildFetch.error) throw { code: 500, message: 'Internal server error', detail: buildFetch.error };

  const data: DbSchemaComment[] = buildFetch.data
    .filter((comment) => comment.reply_to === parentId || !comment.reply_to)
    .map((comment) => ({
      id: comment.id,
      avatar: comment.avatar || null,
      content: comment.content,
      is_flagged: comment.is_flagged,
      name: comment.name,
      parent_id: comment.parent_id || null,
      reply_to: comment.reply_to || null,
      user_id: comment.user_id,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      reports: comment.reports.length ? (comment.reports[0] as any).count : null,
      reply:
        buildFetch.data.length && comment.reply_to
          ? buildFetch.data.filter((reply: DbSchemaComment) => reply.reply_to === comment.id)
          : [],
    }));

  const payload: ApiResponseSuccess<DbSchemaComment[]> = {
    message: 'Success',
    data,
  };

  res.setHeader('Cache-Control', `public, stale-while-revalidate=${c.MAX_SWR}, s-maxage=${c.MAX_AGE}`);
  return res.status(200).json(payload);
}
