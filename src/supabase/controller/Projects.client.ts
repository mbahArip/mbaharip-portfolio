import axios from 'axios';
import { Session } from 'next-auth';
import { isClient } from 'supabase/helper';

import { DbGetOptions, DbProjectResponse, DbProjectResponseSummary } from 'types/Supabase';

import { CreateProjectPayload, UpdateProjectPayload } from './Projects.server';

export async function fetchProjects(opts?: DbGetOptions<'projects'>): Promise<{
  data: DbProjectResponse[];
  totalData: number;
  totalPage: number;
}> {
  isClient();

  const response = (await axios.get('/api/projects', { params: opts ?? {} })).data;
  const { data, totalData, totalPage } = response;

  return { data, totalData, totalPage };
}

export async function fetchProjectsSummary(opts?: DbGetOptions<'projects'>): Promise<{
  data: DbProjectResponseSummary[];
  totalData: number;
  totalPage: number;
}> {
  isClient();

  const response = (await axios.get('/api/projects/summary', { params: opts ?? {} })).data;
  const { data, totalData, totalPage } = response;

  return { data, totalData, totalPage };
}

export async function fetchProjectById(id: string): Promise<DbProjectResponse> {
  isClient();

  const response = (await axios.get(`/api/projects/${id}`)).data;
  const { data } = response;

  return data;
}

export async function requestViewProject(id: string): Promise<void> {
  isClient();

  await axios.post(`/api/projects/${id}/view`);

  return;
}

export async function requestCreateProject(
  payload: CreateProjectPayload,
  session: Session,
): Promise<DbProjectResponse> {
  isClient();

  const response = (
    await axios.post('/api/projects', payload, {
      headers: {
        Authorization: session.user?.email,
      },
    })
  ).data;
  const { data } = response;

  return data;
}
export async function requestUpdateProject(
  id: string,
  payload: UpdateProjectPayload,
  session: Session,
): Promise<DbProjectResponse> {
  isClient();

  const response = (
    await axios.put(`/api/projects/${id}`, payload, {
      headers: {
        Authorization: session.user?.email,
      },
    })
  ).data;
  const { data } = response;

  return data;
}
export async function requestDeleteProjects(ids: string[], session: Session): Promise<void> {
  isClient();

  await axios.delete('/api/projects', {
    data: { ids },
    headers: {
      Authorization: session.user?.email,
    },
  });

  return;
}
export async function requestDeleteProject(id: string, session: Session): Promise<void> {
  isClient();

  await axios.delete(`/api/projects/${id}`, {
    headers: {
      Authorization: session.user?.email,
    },
  });

  return;
}
