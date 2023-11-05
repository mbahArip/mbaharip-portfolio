import axios from 'axios';
import { Session } from 'next-auth';
import { isClient } from 'supabase/helper';

import { DbBlogResponse, DbBlogResponseSummary, DbGetOptions } from 'types/Supabase';

import { CreateBlog, UpdateBlog } from './Blogs.server';

export async function fetchBlogs(opts?: DbGetOptions): Promise<{
  data: DbBlogResponse[];
  totalData: number;
  totalPage: number;
}> {
  isClient();

  const response = (await axios.get('/api/blogs', { params: opts ?? {} })).data;
  const { data, totalData, totalPage } = response;

  return { data, totalData, totalPage };
}

export async function fetchBlogsSummary(opts?: DbGetOptions): Promise<{
  data: DbBlogResponseSummary[];
  totalData: number;
  totalPage: number;
}> {
  isClient();

  const response = (await axios.get('/api/blogs/summary', { params: opts ?? {} })).data;
  const { data, totalData, totalPage } = response;

  return { data, totalData, totalPage };
}

export async function fetchBlogById(id: string): Promise<DbBlogResponse> {
  isClient();

  const response = (await axios.get(`/api/blogs/${id}`)).data;
  const { data } = response;

  return data;
}

export async function requestViewBlog(id: string): Promise<void> {
  isClient();

  await axios.post(`/api/blogs/${id}/views`);

  return;
}

export async function requestCreateBlog(payload: CreateBlog, session: Session): Promise<DbBlogResponse> {
  isClient();

  const response = (
    await axios.post('/api/blogs', payload, {
      headers: {
        Authorization: session.user?.email,
      },
    })
  ).data;
  const { data } = response;

  return data;
}
export async function requestUpdateBlog(id: string, payload: UpdateBlog, session: Session): Promise<DbBlogResponse> {
  isClient();

  const response = (
    await axios.put(`/api/blogs/${id}`, payload, {
      headers: {
        Authorization: session.user?.email,
      },
    })
  ).data;
  const { data } = response;

  return data;
}
export async function requestDeleteBlogs(ids: string[], session: Session): Promise<void> {
  isClient();

  await axios.delete('/api/blogs', {
    data: { ids },
    headers: {
      Authorization: session.user?.email,
    },
  });

  return;
}
export async function requestDeleteBlog(id: string, session: Session): Promise<void> {
  isClient();

  await axios.delete(`/api/blogs/${id}`, {
    headers: {
      Authorization: session.user?.email,
    },
  });

  return;
}
