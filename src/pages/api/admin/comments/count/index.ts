import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';

import supabaseServer from 'utils/client/supabase.server';

import { ApiResponseError, ApiResponseSuccess } from 'types/Common';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | ApiResponseSuccess<{
        comments: number;
        reported: number;
        guestbook: number;
      }>
    | ApiResponseError
  >,
) {
  const { method } = req;

  try {
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

async function GET(
  req: NextApiRequest,
  res: NextApiResponse<
    | ApiResponseSuccess<{
        comments: number;
        reported: number;
        guestbook: number;
      }>
    | ApiResponseError
  >,
) {
  const _all = supabaseServer.from('comments').select('id', { count: 'exact' });
  const _flagged = supabaseServer.from('reports').select('id', { count: 'exact' });
  const _guestbook = supabaseServer.from('guestbooks').select('id', { count: 'exact' });

  const [all, flagged, guestbook] = await Promise.all([_all, _flagged, _guestbook]);
  if (all.error) throw { code: 500, message: all.error.message, detail: all.error.details };
  if (flagged.error) throw { code: 500, message: flagged.error.message, detail: flagged.error.details };
  if (guestbook.error) throw { code: 500, message: guestbook.error.message, detail: guestbook.error.details };

  const payload: ApiResponseSuccess<{
    comments: number;
    reported: number;
    guestbook: number;
  }> = {
    message: 'Success',
    data: {
      comments: all.count ?? 0,
      reported: flagged.count ?? 0,
      guestbook: guestbook.count ?? 0,
    },
  };

  res.setHeader('Cache-Control', `public, stale-while-revalidate=${c.MAX_SWR}, s-maxage=${c.MAX_AGE}`);
  return res.status(200).json(payload);
}
