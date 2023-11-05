import c from 'constant';
import { NextApiRequest } from 'next';
import { checkSession, isServer } from 'supabase/helper';

import supabase from 'utils/client/supabase';
import { buildPagination } from 'utils/supabaseHelper';

import {
  DbBlogCreate,
  DbBlogResponse,
  DbBlogResponseSummary,
  DbBlogUpdate,
  DbGetOptions,
  DbMasterTagResponse,
} from 'types/Supabase';

export async function getBlogs(opts?: DbGetOptions): Promise<{
  data: DbBlogResponse[];
  totalData: number;
  totalPage: number;
}> {
  isServer();

  const page = opts?.page ?? 1;
  const rowsPerPage = opts?.rowsPerPage ?? c.ITEMS_PER_PAGE;
  const { ids, query, tags, order, orderBy } = opts ?? {};
  const range = buildPagination(page, rowsPerPage);

  const fetch = supabase
    .from('blogs')
    .select('*, tags:master_tag!inner(*), comments:comments(*,reply_to:reply_to(*))', { count: 'exact' });

  if (query) fetch.textSearch('title', query);
  if (tags && tags.length > 0) fetch.in('tags.id', tags);
  if (ids && ids.length > 0) fetch.in('id', ids);
  if (order && orderBy) fetch.order(orderBy, { ascending: order === 'asc' });
  fetch.range(range.from, range.to);

  const blogs = await fetch;
  if (blogs.error) throw blogs.error;

  return {
    data: blogs.data,
    totalData: blogs.count ?? 0,
    totalPage: Math.ceil((blogs.count ?? 0) / rowsPerPage),
  };
}

export async function getBlogsSummary(opts?: DbGetOptions): Promise<{
  data: DbBlogResponseSummary[];
  totalData: number;
  totalPage: number;
}> {
  isServer();

  const page = opts?.page ?? 1;
  const rowsPerPage = opts?.rowsPerPage ?? c.ITEMS_PER_PAGE;
  const { ids, query, tags, order, orderBy } = opts ?? {};
  const range = buildPagination(page, rowsPerPage);

  const fetch = supabase
    .from('blogs')
    .select(
      'id,created_at,updated_at,title,summary,is_featured,views,thumbnail_url,comments:comments(count),tags:master_tag!inner(*)',
      { count: 'exact' },
    );

  if (query) fetch.ilike('title', `%${query}%`);
  if (tags && tags.length > 0) fetch.in('tags.id', tags);
  if (ids && ids.length > 0) fetch.in('id', ids);
  if (order && orderBy) fetch.order(orderBy, { ascending: order === 'asc' });
  fetch.range(range.from, range.to);

  const blogs = await fetch;
  if (blogs.error) throw blogs.error;

  const data = blogs.data.map((blog) => ({
    ...blog,
    comments: (blog.comments[0] as any).count,
  }));

  return {
    data: data,
    totalData: blogs.count ?? 0,
    totalPage: Math.ceil((blogs.count ?? 0) / rowsPerPage),
  };
}

export async function getBlogById(id: string): Promise<DbBlogResponse> {
  isServer();

  const blog = await supabase
    .from('blogs')
    .select('*, tags:master_tag!inner(*), comments:comments(*,reply_to:reply_to(*))')
    .match({ id })
    .single();
  if (blog.error) throw blog.error;

  return blog.data;
}

export interface CreateBlog extends DbBlogCreate {
  tags: string;
  newTags?: string;
}
export async function createBlog(request: NextApiRequest, payload: CreateBlog): Promise<DbBlogResponse> {
  const authorization = await checkSession(request);
  if (!authorization) throw { code: 401, message: 'Unauthorized' };

  const { title, summary, content, thumbnail_url, tags: _tags, newTags: _newTags } = payload;
  if (!title || !summary || !content || !thumbnail_url || !_tags) throw new Error('Missing required fields');

  const tags = JSON.parse(_tags) as DbMasterTagResponse[];
  const newTags = _newTags ? (JSON.parse(_newTags) as DbMasterTagResponse[]) : [];
  let newTagsResponse: DbMasterTagResponse[] = [];

  if (newTags.length) {
    for (const tag of newTags) {
      const res = await supabase
        .from('master_tag')
        .insert({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          created_at: tag.created_at,
          updated_at: tag.updated_at,
        })
        .select('*')
        .single();
      if (res.error) throw res.error;
      newTagsResponse.push(res.data);
    }
  }

  const encodedContent = Buffer.from(content).toString('base64');

  const addBlogRequest = await supabase
    .from('blogs')
    .insert({
      title,
      summary,
      content: encodedContent,
      thumbnail_url,
    })
    .select('*')
    .single();
  if (addBlogRequest.error) throw addBlogRequest.error;

  const tagsId = [...tags, ...newTagsResponse].map((tag) => tag.id);
  for (const tagId of tagsId) {
    await supabase.from('map_blog_tag').insert({
      blog_id: addBlogRequest.data.id,
      tag_id: tagId,
    });
  }

  const data: DbBlogResponse = {
    ...addBlogRequest.data,
    tags: [...tags, ...newTagsResponse],
    comments: [],
  };

  return data;
}

export interface UpdateBlog extends DbBlogUpdate {
  tags?: string;
  newTags?: string;
}
export async function updateBlog(request: NextApiRequest, id: string, payload: UpdateBlog): Promise<DbBlogResponse> {
  const authorization = await checkSession(request);
  if (!authorization) throw { code: 401, message: 'Unauthorized' };

  const { title, summary, content, thumbnail_url, tags: _tags, newTags: _newTags } = payload;
  if (!title && !summary && !content && !thumbnail_url && !_tags && !_newTags)
    throw new Error('Missing fields, at least one field is required');

  const currentBlog = await supabase.from('blogs').select('*,tags:master_tag!inner(*)').match({ id }).single();
  if (currentBlog.error) throw currentBlog.error;

  const tags = JSON.parse(_tags ?? '[]') as DbMasterTagResponse[];
  const newTags = JSON.parse(_newTags ?? '[]') as DbMasterTagResponse[];
  const combinedUpdateTags: DbMasterTagResponse[] = [...tags, ...newTags];

  const addTags = combinedUpdateTags.filter(
    (tag) => !(currentBlog.data.tags as DbMasterTagResponse[]).find((t) => t.id === tag.id),
  );
  const removeTags = (currentBlog.data.tags as DbMasterTagResponse[]).filter(
    (tag) => !combinedUpdateTags.find((t) => t.id === tag.id),
  );

  const newTagsResponse: DbMasterTagResponse[] = [];

  if (addTags.length) {
    for (const tag of addTags) {
      const _upsertTag = supabase.from('master_tag').upsert({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        created_at: tag.created_at,
        updated_at: tag.updated_at,
      });
      const _newTagRequest = supabase.from('map_blog_tag').insert({
        blog_id: id,
        tag_id: tag.id,
      });
      const [upsertTag, newTagRequest] = await Promise.all([_upsertTag, _newTagRequest]);
      if (upsertTag.error) throw upsertTag.error;
      if (newTagRequest.error) throw newTagRequest.error;
      newTagsResponse.push(tag);
    }
  }
  if (removeTags.length) {
    const removeTagsRequest = await supabase
      .from('map_blog_tag')
      .delete()
      .in(
        'tag_id',
        removeTags.map((tag) => tag.id),
      );
    if (removeTagsRequest.error) throw removeTagsRequest.error;
  }

  const updateRequest = await supabase
    .from('blogs')
    .update({
      title: title ?? undefined,
      summary: summary ?? undefined,
      content: content ? Buffer.from(content).toString('base64') : undefined,
      thumbnail_url: thumbnail_url ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .match({ id })
    .select('*')
    .single();
  if (updateRequest.error) throw updateRequest.error;

  const data: DbBlogResponse = {
    ...updateRequest.data,
    tags: [...tags, ...newTagsResponse],
    comments: [],
  };

  return data;
}

export async function deleteBlog(request: NextApiRequest, id: string): Promise<DbBlogResponse> {
  const authorization = await checkSession(request);
  if (!authorization) throw { code: 401, message: 'Unauthorized' };

  const deleteRequest = await supabase.from('blogs').delete().match({ id }).select('*').single();
  if (deleteRequest.error) throw deleteRequest.error;

  const data: DbBlogResponse = {
    ...deleteRequest.data,
    tags: [],
    comments: [],
  };

  return data;
}
export async function deleteBlogs(request: NextApiRequest, ids: string[]): Promise<{ count: number }> {
  const authorization = await checkSession(request);
  if (!authorization) throw { code: 401, message: 'Unauthorized' };

  if (!ids.length) throw new Error('Missing required fields');

  const deleteRequest = await supabase.from('blogs').delete().in('id', ids).select('*');
  if (deleteRequest.error) throw deleteRequest.error;

  return { count: deleteRequest.count ?? deleteRequest.data.length ?? 0 };
}
