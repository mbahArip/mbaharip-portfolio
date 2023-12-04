import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';

import supabaseServer from 'utils/client/supabase.server';
import { buildPagination } from 'utils/supabaseHelper';

import { ApiResponseSuccess } from 'types/Common';
import { DbGetOptions, DbSchemaComment } from 'types/Supabase';

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
  const { ids, page, rowsPerPage, query, is_flagged, is_reply, order, orderBy } = req.query as Record<
    keyof DbGetOptions<'comments'>,
    string
  >;

  const range = buildPagination(Number(page || 1), Number(rowsPerPage || c.ITEMS_PER_PAGE));

  const buildFetch = supabaseServer
    .from('comments')
    .select('*, post:posts(id,title), reports(count)', { count: 'exact' });
  // .is('parent_id', null);
  if (query) {
    const uuidRegex = new RegExp('^[0-9a-f]{8}-?[0-9a-f]{4}-?4[0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$', 'i');
    if (uuidRegex.test(query)) buildFetch.or(`id.eq.${query},parent_id.eq.${query},reply_to.eq.${query}`);
    else buildFetch.or(`content.ilike.%${query}%,name.ilike.%${query}%`);
  }
  if (is_flagged && is_flagged === 'true') buildFetch.eq('is_flagged', true);
  if (ids) buildFetch.in('id', ids.split(':'));
  buildFetch.order(orderBy ?? 'created_at', { ascending: order ? order === 'asc' : false });

  const { data, error, count } = await buildFetch.range(range.from, range.to);
  if (error) return res.status(500).json({ message: error.message, details: error.details || error.hint });

  const replyFetch = await supabaseServer
    .from('comments')
    .select('id, reply_to', { count: 'exact' })
    .in(
      'reply_to',
      data.map((comment) => comment.id),
    );

  if (replyFetch.error)
    return res
      .status(500)
      .json({ message: replyFetch.error.message, details: replyFetch.error.details || replyFetch.error.hint });

  const totalPages = Math.ceil((count ?? 0) / Number(rowsPerPage || c.ITEMS_PER_PAGE));
  if (Number(page || 1) > totalPages && totalPages !== 0) throw { code: 404, message: 'Page not found' };

  const payload: ApiResponseSuccess<DbSchemaComment[]> = {
    message: 'Success',
    data: data.map((comment) => ({
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
      post: comment.post.length ? comment.post[0] : null,
      reports: comment.reports.length ? (comment.reports[0] as any).count : 0,
      reply: replyFetch.count ? replyFetch.data.filter((reply) => reply.reply_to === comment.id).length : 0,
    })),
    pagination: {
      page: Number(page || 1),
      itemsPerPage: Number(rowsPerPage || c.ITEMS_PER_PAGE),
      totalData: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / Number(rowsPerPage || c.ITEMS_PER_PAGE)),
      isNextPage: (count ?? 0) > Number(rowsPerPage || c.ITEMS_PER_PAGE),
      isPrevPage: Number(page || 1) > 1,
    },
  };

  res.setHeader('Cache-Control', `public, stale-while-revalidate=${c.MAX_SWR}, s-maxage=${c.MAX_AGE}`);
  return res.status(200).json(payload);
}
