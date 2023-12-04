import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';

import supabaseServer from 'utils/client/supabase.server';

import { ApiResponseError, ApiResponseSuccess } from 'types/Common';

type Count = {
  posts: number;
  draft: number;
  published: number;
  unpublished: number;
  comments: number;
  reported: number;
  guestbook: number;
  inbox: number;
  categories: number;
  tags: number;
  media: number;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseSuccess<Count> | ApiResponseError>,
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

async function GET(req: NextApiRequest, res: NextApiResponse<ApiResponseSuccess<Count> | ApiResponseError>) {
  const _posts = supabaseServer.from('posts').select('id', { count: 'exact' });
  const _draft = supabaseServer.from('posts').select('id', { count: 'exact' }).eq('status', 'draft');
  const _published = supabaseServer.from('posts').select('id', { count: 'exact' }).eq('status', 'published');
  const _unpublished = supabaseServer.from('posts').select('id', { count: 'exact' }).eq('status', 'unpublished');

  const _comments = supabaseServer.from('comments').select('id', { count: 'exact' });
  const _reported = supabaseServer.from('reports').select('id', { count: 'exact' });
  const _guestbook = supabaseServer.from('guestbooks').select('id', { count: 'exact' });

  const _inbox = supabaseServer.from('mail').select('id', { count: 'exact' });
  const _categories = supabaseServer.from('master_cat').select('id', { count: 'exact' });
  const _tags = supabaseServer.from('master_tag').select('id', { count: 'exact' });
  const _media = supabaseServer.from('attachments').select('id', { count: 'exact' });

  const [posts, draft, published, unpublished, comments, reported, guestbook, inbox, categories, tags, media] =
    await Promise.all([
      _posts,
      _draft,
      _published,
      _unpublished,
      _comments,
      _reported,
      _guestbook,
      _inbox,
      _categories,
      _tags,
      _media,
    ]);
  if (posts.error) throw { code: 500, message: posts.error.message, detail: posts.error.details };
  if (draft.error) throw { code: 500, message: draft.error.message, detail: draft.error.details };
  if (published.error) throw { code: 500, message: published.error.message, detail: published.error.details };
  if (unpublished.error) throw { code: 500, message: unpublished.error.message, detail: unpublished.error.details };
  if (comments.error) throw { code: 500, message: comments.error.message, detail: comments.error.details };
  if (reported.error) throw { code: 500, message: reported.error.message, detail: reported.error.details };
  if (guestbook.error) throw { code: 500, message: guestbook.error.message, detail: guestbook.error.details };
  if (inbox.error) throw { code: 500, message: inbox.error.message, detail: inbox.error.details };
  if (categories.error) throw { code: 500, message: categories.error.message, detail: categories.error.details };
  if (tags.error) throw { code: 500, message: tags.error.message, detail: tags.error.details };
  if (media.error) throw { code: 500, message: media.error.message, detail: media.error.details };

  const payload: ApiResponseSuccess<Count> = {
    message: 'Success',
    data: {
      posts: posts.count ?? 0,
      draft: draft.count ?? 0,
      published: published.count ?? 0,
      unpublished: unpublished.count ?? 0,
      comments: comments.count ?? 0,
      reported: reported.count ?? 0,
      guestbook: guestbook.count ?? 0,
      inbox: inbox.count ?? 0,
      categories: categories.count ?? 0,
      tags: tags.count ?? 0,
      media: media.count ?? 0,
    },
  };

  res.setHeader('Cache-Control', `public, stale-while-revalidate=${c.MAX_SWR}, s-maxage=${c.MAX_AGE}`);
  return res.status(200).json(payload);
}
