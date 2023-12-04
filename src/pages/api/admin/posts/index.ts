import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';

import supabaseClient from 'utils/client/supabase.client';
import supabaseServer from 'utils/client/supabase.server';
import { buildPagination } from 'utils/supabaseHelper';

import { ApiResponseError, ApiResponseSuccess } from 'types/Common';
import {
  DbGetOptions,
  DbSchemaComment,
  DbSchemaMasterCategory,
  DbSchemaMasterTag,
  DbSchemaPost,
  DbSchemaPostInsert,
} from 'types/Supabase';

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
async function GET(req: NextApiRequest, res: NextApiResponse<ApiResponseSuccess<DbSchemaPost[]> | ApiResponseError>) {
  const { ids, page, rowsPerPage, query, tags, status, category, order, orderBy, is_featured } = req.query as Record<
    keyof DbGetOptions<'posts'>,
    string
  >;

  const range = buildPagination(Number(page || 1), Number(rowsPerPage || c.ITEMS_PER_PAGE));
  const tagRelations = await supabaseClient
    .from('posts_tags_relations')
    .select('post_id,tag_id')
    .in('tag_id', tags ? tags.split(',') : []);
  if (tagRelations.error) throw { code: 500, message: tagRelations.error.message, detail: tagRelations.error.details };

  const buildFetch = supabaseClient
    .from('posts')
    .select(
      '*,attachment:attachments(*),category_data:master_cat(*),tags:master_tag(*),comments:comments(*,reply_to(*))',
      {
        count: 'exact',
      },
    );

  if (query) buildFetch.or(`title.ilike.%${query}%,summary.ilike.%${query}%`);
  if (tags) {
    const postIds = tagRelations.data.map((relation) => relation.post_id);
    buildFetch.in('id', postIds);
  }
  if (status) buildFetch.eq('status', status);
  if (category) buildFetch.eq('category', category);
  if (is_featured) buildFetch.eq('is_featured', is_featured === 'true' ? true : false);
  if (ids) buildFetch.in('id', ids.split(','));
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

  const payload: ApiResponseSuccess<DbSchemaPost[]> = {
    message: 'Success',
    data:
      data.map((post) => ({
        id: post.id,
        created_at: post.created_at,
        updated_at: post.updated_at,
        content: post.content,
        extra_metadata: post.extra_metadata,
        is_featured: post.is_featured,
        slug: post.slug,
        status: post.status,
        summary: post.summary,
        thumbnail_attachment: post.attachment!,
        title: post.title,
        category: post.category_data as DbSchemaMasterCategory,
        tags: post.tags.sort((a, b) => a.id.localeCompare(b.id)) ?? [],
        comments:
          post.comments.map((comment) => ({
            ...comment,
            reply_to: comment.reply_to as unknown as DbSchemaComment,
          })) ?? [],
        count: {
          comments: post.comments.length,
          views: post.views,
        },
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
async function POST(req: NextApiRequest, res: NextApiResponse<ApiResponseSuccess<DbSchemaPost> | ApiResponseError>) {
  const body = req.body as Record<keyof DbSchemaPostInsert, string>;
  const {
    category,
    content,
    extra_metadata,
    is_featured,
    slug,
    summary,
    thumbnail_attachment,
    title,
    tags: _tags,
    newTags: _newTags,
  } = body;
  if (!category || !content || !summary || !thumbnail_attachment || !title || !_tags)
    throw { code: 400, message: 'Bad request', detail: 'Missing required field(s)' };

  const tags = JSON.parse(_tags) as DbSchemaMasterTag[];
  const newTags = _newTags ? (JSON.parse(_newTags) as DbSchemaMasterTag[]) : [];
  let newTagsRes: DbSchemaMasterTag[] = [];

  if (newTags.length) {
    for (const tag of newTags) {
      const tagReq = await supabaseServer.from('master_tag').insert(tag).select('*').single();
      if (tagReq.error) throw { code: 500, message: tagReq.error.message, detail: tagReq.error.details };
      newTagsRes.push(tagReq.data);
    }
  }

  const encodedContent = Buffer.from(content).toString('base64');

  const addPost = await supabaseServer
    .from('posts')
    .insert({
      title,
      summary,
      content: encodedContent,
      category: category,
      status: 'published',
      thumbnail_attachment: Number(thumbnail_attachment),
      is_featured: is_featured === 'true' ? true : false,
      extra_metadata: extra_metadata ? JSON.parse(extra_metadata) : {},
      slug,
      views: 0,
    })
    .select('*,attachment:attachments(*),category:master_cat!inner(*)')
    .single();
  if (addPost.error) throw { code: 500, message: addPost.error.message, detail: addPost.error.details };

  const tagsId = [...tags, ...newTagsRes].map((tag) => tag.id);
  for (const tagId of tagsId) {
    await supabaseServer.from('posts_tags_relations').insert({
      post_id: addPost.data.id,
      tag_id: tagId,
    });
  }

  const payload: ApiResponseSuccess<DbSchemaPost> = {
    message: 'Success',
    data: {
      id: addPost.data.id,
      created_at: addPost.data.created_at,
      updated_at: addPost.data.updated_at,
      content: addPost.data.content,
      extra_metadata: addPost.data.extra_metadata,
      is_featured: addPost.data.is_featured,
      slug: addPost.data.slug,
      status: addPost.data.status,
      summary: addPost.data.summary,
      thumbnail_attachment: addPost.data.attachment!,
      title: addPost.data.title,
      category: addPost.data.category as DbSchemaMasterCategory,
      tags: [...tags, ...newTagsRes],
      comments: [],
      count: {
        comments: 0,
        views: 0,
      },
    },
  };

  return res.status(201).json(payload);
}

// Delete multiple posts
async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseSuccess<{ count: number }> | ApiResponseError>,
) {
  const { ids } = req.body as Record<'ids', string[]>;
  if (!ids) throw { code: 400, message: 'Bad request', detail: 'Missing required field(s)' };
  if (ids.length <= 1)
    throw {
      code: 400,
      message: 'Bad request',
      detail: 'This endpoint are used for bulk delete.',
    };

  const deleteReq = await supabaseServer.from('posts').delete().in('id', ids).select('id');
  if (deleteReq.error) throw { code: 500, message: deleteReq.error.message, detail: deleteReq.error.details };

  const payload: ApiResponseSuccess<{ count: number }> = {
    message: 'Success',
    data: {
      count: deleteReq.data.length,
    },
  };

  return res.status(200).json(payload);
}
