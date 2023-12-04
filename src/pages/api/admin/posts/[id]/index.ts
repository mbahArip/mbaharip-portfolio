import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';

import supabaseClient from 'utils/client/supabase.client';
import supabaseServer from 'utils/client/supabase.server';

import { ApiResponseError, ApiResponseSuccess } from 'types/Common';
import {
  DbSchemaComment,
  DbSchemaMasterCategory,
  DbSchemaMasterTag,
  DbSchemaPost,
  DbSchemaPostUpdate,
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
      case 'PUT':
        return await PUT(req, res);
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

async function GET(req: NextApiRequest, res: NextApiResponse<ApiResponseSuccess<DbSchemaPost> | ApiResponseError>) {
  const { id } = req.query as { id: string };

  const post = await supabaseClient
    .from('posts')
    .select(
      '*,attachment:attachments(*),category:master_cat!inner(*),tags:master_tag!inner(*),comments:comments(*,reply_to(*))',
    )
    .eq('id', id as string)
    .single();

  if (post.error) throw { code: 500, message: post.error.message, detail: post.error.details };

  const payload: ApiResponseSuccess<DbSchemaPost> = {
    message: 'Success',
    data: {
      id: post.data.id,
      created_at: post.data.created_at,
      updated_at: post.data.updated_at,
      content: post.data.content,
      extra_metadata: post.data.extra_metadata,
      is_featured: post.data.is_featured,
      slug: post.data.slug,
      status: post.data.status,
      summary: post.data.summary,
      thumbnail_attachment: post.data.attachment!,
      title: post.data.title,
      category: post.data.category as DbSchemaMasterCategory,
      tags: post.data.tags ?? [],
      comments:
        post.data.comments.map((comment) => ({
          ...comment,
          reply_to: comment.reply_to as unknown as DbSchemaComment,
        })) ?? [],
      count: {
        comments: post.data.comments.length,
        views: post.data.views,
      },
    },
  };

  res.setHeader('Cache-Control', `public, stale-while-revalidate=${c.MAX_SWR}, s-maxage=${c.MAX_AGE}`);
  return res.status(200).json(payload);
}

async function PUT(req: NextApiRequest, res: NextApiResponse<ApiResponseSuccess<undefined> | ApiResponseError>) {
  const { id } = req.query as { id: string };
  const body = req.body as DbSchemaPostUpdate;

  const currentTagsReq = await supabaseServer.from('posts_tags_relations').select('tag_id').eq('post_id', id);
  if (currentTagsReq.error)
    throw { code: 500, message: currentTagsReq.error.message, detail: currentTagsReq.error.details };
  const currentTags: string[] = currentTagsReq.data.map((tag) => tag.tag_id);

  const updateTags: DbSchemaMasterTag[] = body.tags || [];
  const newTagsData: DbSchemaMasterTag[] = [];
  if (body.newTags) {
    for (const tag of body.newTags) {
      const { data, error } = await supabaseServer.from('master_tag').insert(tag).select('*').single();
      if (error) throw { code: 500, message: error.message, detail: error.details };
      newTagsData.push(data);
    }
  }
  const combinedTags: string[] = [...updateTags.map((tag) => tag.id), ...newTagsData.map((tag) => tag.id)];

  const deleteTags: string[] = currentTags.filter((tag) => !combinedTags.includes(tag));
  const insertTags: string[] = combinedTags.filter((tag) => !currentTags.includes(tag));

  const deleteTagsRelationReq = await supabaseServer
    .from('posts_tags_relations')
    .delete()
    .in('tag_id', deleteTags)
    .eq('post_id', id);
  if (deleteTagsRelationReq.error)
    throw { code: 500, message: deleteTagsRelationReq.error.message, detail: deleteTagsRelationReq.error.details };
  if (insertTags.length) {
    for (const tag of insertTags) {
      const insertTagsRelationReq = await supabaseServer
        .from('posts_tags_relations')
        .insert({ post_id: id, tag_id: tag });
      if (insertTagsRelationReq.error)
        throw { code: 500, message: insertTagsRelationReq.error.message, detail: insertTagsRelationReq.error.details };
    }
  }

  const updatePostReq = await supabaseServer
    .from('posts')
    .update({
      category: body.category,
      content: body.content,
      extra_metadata: body.extra_metadata,
      is_featured: body.is_featured,
      slug: body.slug,
      status: body.status,
      summary: body.summary,
      thumbnail_attachment: body.thumbnail_attachment,
      title: body.title,
      updated_at: new Date().toISOString(),
    })
    .match({ id });
  if (updatePostReq.error)
    throw { code: 500, message: updatePostReq.error.message, detail: updatePostReq.error.details };

  return res.status(200).json({ message: 'Success', data: undefined });
}

async function DELETE(req: NextApiRequest, res: NextApiResponse<ApiResponseSuccess | ApiResponseError>) {
  const { id } = req.query as { id: string };

  const deleteReq = await supabaseServer.from('posts').delete().match({ id });
  if (deleteReq.error) throw { code: 500, message: deleteReq.error.message, detail: deleteReq.error.details };

  const payload: ApiResponseSuccess = {
    message: 'Success',
    data: undefined,
  };

  return res.status(200).json(payload);
}
