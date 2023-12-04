import c from 'constant';
import { NextApiRequest } from 'next';
import { checkSession, isServer } from 'supabase/helper';

import supabase from 'utils/client/supabase';
import { buildPagination } from 'utils/supabaseHelper';

import {
  DbGetOptions,
  DbMasterStackResponse,
  DbProjectCreate,
  DbProjectResponse,
  DbProjectResponseSummary,
  DbProjectUpdate,
} from 'types/Supabase';

export async function getProjects(opts?: DbGetOptions<'projects'>): Promise<{
  data: DbProjectResponse[];
  totalData: number;
  totalPage: number;
}> {
  isServer();

  const page = opts?.page ?? 1;
  const rowsPerPage = opts?.rowsPerPage ?? c.ITEMS_PER_PAGE;
  const { ids, query, stacks, order, orderBy } = opts ?? {};
  const range = buildPagination(page, rowsPerPage);

  const fetch = supabase
    .from('projects')
    .select('*, stacks:master_stack!inner(*), comments:comments(*,reply_to:reply_to(*))', { count: 'exact' });

  if (query) fetch.textSearch('title', query);
  if (stacks && stacks.length > 0) fetch.in('stacks.id', stacks);
  if (ids && ids.length > 0) fetch.in('id', ids);
  if (order && orderBy) fetch.order(orderBy, { ascending: order === 'asc' });
  fetch.range(range.from, range.to);

  const projects = await fetch;
  if (projects.error) throw projects.error;

  return {
    data: projects.data,
    totalData: projects.count ?? 0,
    totalPage: Math.ceil((projects.count ?? 0) / rowsPerPage),
  };
}

export async function getProjectsSummary(opts?: DbGetOptions<'projects'>): Promise<{
  data: DbProjectResponseSummary[];
  totalData: number;
  totalPage: number;
}> {
  isServer();

  const page = opts?.page ?? 1;
  const rowsPerPage = opts?.rowsPerPage ?? c.ITEMS_PER_PAGE;
  const { ids, query, stacks, order, orderBy } = opts ?? {};
  const range = buildPagination(page, rowsPerPage);

  const fetch = supabase
    .from('projects')
    .select(
      'id,created_at,updated_at,title,summary,is_featured,demo_url,source_url,views,thumbnail_url,comments:comments(count),stacks:master_stack!inner(*)',
      { count: 'exact' },
    );

  if (query) fetch.ilike('title', `%${query}%`);
  if (stacks && stacks.length > 0) fetch.in('stacks.id', stacks);
  if (ids && ids.length > 0) fetch.in('id', ids);
  if (order && orderBy) fetch.order(orderBy, { ascending: order === 'asc' });
  fetch.range(range.from, range.to);

  const projects = await fetch;
  if (projects.error) throw projects.error;

  const data = projects.data.map((project) => ({
    ...project,
    comments: (project.comments[0] as any).count,
  }));

  return {
    data: data,
    totalData: projects.count ?? 0,
    totalPage: Math.ceil((projects.count ?? 0) / rowsPerPage),
  };
}

export async function getProjectById(id: string): Promise<DbProjectResponse> {
  isServer();

  const project = await supabase
    .from('projects')
    .select('*, stacks:master_stack!inner(*), comments:comments(*,reply_to:reply_to(*))')
    .match({ id })
    .single();
  if (project.error) throw project.error;

  return project.data;
}

export interface CreateProjectPayload extends DbProjectCreate {
  stacks: string;
  newStacks?: string;
}
export async function createProject(
  request: NextApiRequest,
  payload: CreateProjectPayload,
): Promise<DbProjectResponse> {
  const authorization = await checkSession(request);
  if (!authorization) throw { code: 401, message: 'Unauthorized' };

  const {
    title,
    summary,
    content,
    thumbnail_url,
    is_featured,
    demo_url,
    source_url,
    stacks: _stacks,
    newStacks: _newStacks,
  } = payload;
  if (!title || !summary || !content || !thumbnail_url || !_stacks) throw new Error('Missing required fields');

  const stacks = JSON.parse(_stacks) as DbMasterStackResponse[];
  const newStacks = _newStacks ? (JSON.parse(_newStacks) as DbMasterStackResponse[]) : [];
  let newStacksResponse: DbMasterStackResponse[] = [];

  if (newStacks.length) {
    for (const stack of newStacks) {
      const res = await supabase
        .from('master_stack')
        .insert({
          id: stack.id,
          name: stack.name,
          icon_url: stack.icon_url,
          created_at: stack.created_at,
          updated_at: stack.updated_at,
        })
        .select('*')
        .single();
      if (res.error) throw res.error;
      newStacksResponse.push(res.data);
    }
  }

  const encodedContent = Buffer.from(content).toString('base64');

  const addProjectRequest = await supabase
    .from('projects')
    .insert({
      title,
      summary,
      content: encodedContent,
      is_featured,
      thumbnail_url,
      demo_url,
      source_url,
    })
    .select('*')
    .single();
  if (addProjectRequest.error) throw addProjectRequest.error;

  const stacksId = [...stacks, ...newStacksResponse].map((tag) => tag.id);
  for (const stackId of stacksId) {
    await supabase.from('map_project_stack').insert({
      project_id: addProjectRequest.data.id,
      stack_id: stackId,
    });
  }

  const data: DbProjectResponse = {
    ...addProjectRequest.data,
    stacks: [...stacks, ...newStacksResponse],
    comments: [],
  };

  return data;
}

export interface UpdateProjectPayload extends DbProjectUpdate {
  stacks?: string;
  newStacks?: string;
}
export async function updateProject(
  request: NextApiRequest,
  id: string,
  payload: UpdateProjectPayload,
): Promise<DbProjectResponse> {
  const authorization = await checkSession(request);
  if (!authorization) throw { code: 401, message: 'Unauthorized' };

  const {
    title,
    summary,
    content,
    thumbnail_url,
    is_featured,
    demo_url,
    source_url,
    stacks: _stacks,
    newStacks: _newStacks,
  } = payload;
  if (
    !title &&
    !summary &&
    !content &&
    is_featured !== false &&
    is_featured !== true &&
    is_featured !== undefined &&
    is_featured !== null &&
    !thumbnail_url &&
    !demo_url &&
    !source_url &&
    !_stacks &&
    !_newStacks
  )
    throw new Error('Missing fields, at least one field is required');

  const currentProject = await supabase
    .from('projects')
    .select('*,stacks:master_stack!inner(*)')
    .match({ id })
    .single();
  if (currentProject.error) throw currentProject.error;

  const stacks = JSON.parse(_stacks ?? '[]') as DbMasterStackResponse[];
  const newStacks = JSON.parse(_newStacks ?? '[]') as DbMasterStackResponse[];
  const combinedUpdateStacks: DbMasterStackResponse[] = [...stacks, ...newStacks];

  const addStacks = combinedUpdateStacks.filter(
    (stack) => !(currentProject.data.stacks as DbMasterStackResponse[]).find((s) => s.id === stack.id),
  );
  const removeStacks = (currentProject.data.stacks as DbMasterStackResponse[]).filter(
    (stack) => !combinedUpdateStacks.find((s) => s.id === stack.id),
  );

  const newStacksResponse: DbMasterStackResponse[] = [];

  if (addStacks.length && (stacks.length || newStacks.length)) {
    for (const stack of addStacks) {
      const _upsertStack = supabase.from('master_stack').upsert({
        id: stack.id,
        name: stack.name,
        icon_url: stack.icon_url,
        created_at: stack.created_at,
        updated_at: stack.updated_at,
      });
      const _newStackRequest = supabase.from('map_project_stack').insert({
        project_id: id,
        stack_id: stack.id,
      });
      const [upsertStack, newStackRequest] = await Promise.all([_upsertStack, _newStackRequest]);
      if (upsertStack.error) throw upsertStack.error;
      if (newStackRequest.error) throw newStackRequest.error;
      newStacksResponse.push(stack);
    }
  }
  if (removeStacks.length && (stacks.length || newStacks.length)) {
    const removeStackRequest = await supabase
      .from('map_project_stack')
      .delete()
      .in(
        'stack_id',
        removeStacks.map((stack) => stack.id),
      );
    if (removeStackRequest.error) throw removeStackRequest.error;
  }

  const updateRequest = await supabase
    .from('projects')
    .update({
      title: title ?? undefined,
      summary: summary ?? undefined,
      content: content ? Buffer.from(content).toString('base64') : undefined,
      demo_url: demo_url ?? undefined,
      source_url: source_url ?? undefined,
      is_featured: is_featured ?? undefined,
      thumbnail_url: thumbnail_url ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .match({ id })
    .select('*')
    .single();
  if (updateRequest.error) throw updateRequest.error;

  const data: DbProjectResponse = {
    ...updateRequest.data,
    stacks: [...stacks, ...newStacksResponse],
    comments: [],
  };

  return data;
}

export async function deleteProject(request: NextApiRequest, id: string): Promise<DbProjectResponse> {
  const authorization = await checkSession(request);
  if (!authorization) throw { code: 401, message: 'Unauthorized' };

  const deleteRequest = await supabase.from('projects').delete().match({ id }).select('*').single();
  if (deleteRequest.error) throw deleteRequest.error;

  const data: DbProjectResponse = {
    ...deleteRequest.data,
    stacks: [],
    comments: [],
  };

  return data;
}
export async function deleteProjects(request: NextApiRequest, ids: string[]): Promise<{ count: number }> {
  const authorization = await checkSession(request);
  if (!authorization) throw { code: 401, message: 'Unauthorized' };

  if (!ids.length) throw new Error('Missing required fields');

  const deleteRequest = await supabase.from('projects').delete().in('id', ids).select('*');
  if (deleteRequest.error) throw deleteRequest.error;

  return { count: deleteRequest.count ?? deleteRequest.data.length ?? 0 };
}
