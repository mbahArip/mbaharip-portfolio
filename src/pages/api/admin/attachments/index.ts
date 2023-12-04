import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';

import supabaseClient from 'utils/client/supabase.client';
import supabaseServer from 'utils/client/supabase.server';
import { buildPagination } from 'utils/supabaseHelper';

import { ApiResponseError, ApiResponseSuccess } from 'types/Common';
import { DbGetOptions, DbSchemaAttachment, DbSchemaAttachmentInsert, DbSchemaPost } from 'types/Supabase';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
};

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
      case 'POST':
        return await POST(req, res);
      case 'DELETE':
        return await DELETE(req, res);
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
async function GET(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseSuccess<DbSchemaAttachment[]> | ApiResponseError>,
) {
  const { ids, page, rowsPerPage, query, order, orderBy } = req.query as Record<
    keyof DbGetOptions<'attachments'>,
    string
  >;

  const range = buildPagination(Number(page || 1), Number(rowsPerPage || c.ITEMS_PER_PAGE));

  const buildFetch = supabaseClient.from('attachments').select('*', {
    count: 'exact',
  });

  if (query) buildFetch.or(`title.ilike.%${query}%,summary.ilike.%${query}%`);
  if (ids) buildFetch.in('id', ids.split(':'));
  buildFetch.order(orderBy ?? 'created_at', { ascending: order ? order === 'asc' : false });

  const { data, error, count } = await buildFetch.range(range.from, range.to);
  if (error) throw { code: 500, message: error.message, detail: error.details || error.hint };

  const totalPages = Math.ceil((count ?? 0) / Number(rowsPerPage || c.ITEMS_PER_PAGE));
  if (Number(page || 1) > totalPages && totalPages !== 0)
    throw {
      code: 404,
      message: 'Page not found',
      detail: `You are trying to query page ${page ?? 1}, but total pages is ${totalPages}`,
    };

  const payload: ApiResponseSuccess<DbSchemaAttachment[]> = {
    message: 'Success',
    data:
      data.map((post) => ({
        id: post.id,
        created_at: post.created_at,
        name: post.name,
        path: post.path,
        post: undefined,
        size: post.size,
      })) ?? [],
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

// Create new post
async function POST(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseSuccess<DbSchemaAttachment> | ApiResponseError>,
) {
  const body = req.body as DbSchemaAttachmentInsert;

  const newAttachment = await supabaseServer
    .from('attachments')
    .insert({
      name: body.name,
      path: body.path,
      size: body.size,
    })
    .select('*')
    .single();
  if (newAttachment.error)
    throw { code: 500, message: newAttachment.error.message, detail: newAttachment.error.details };

  return res.status(201).json({ message: 'Success', data: newAttachment.data });
}

// Delete multiple posts
async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseSuccess<{ count: number }> | ApiResponseError>,
) {
  return res.status(200).json({ message: 'Success', data: { count: 0 } });
}
