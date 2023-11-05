import { GetStaticPropsContext } from 'next';

import PostLayout from 'components/Layout/PostLayout';
import MarkdownRender from 'components/MarkdownRender';

import supabase from 'utils/client/supabase';
import { createPostId, getPostId } from 'utils/postIdHelper';

import { DbProjectResponse } from 'types/Supabase';

interface ProjectDetailsProps {
  project: DbProjectResponse;
}
export default function ProjectDetails(props: ProjectDetailsProps) {
  return (
    <>
      <PostLayout
        seo={{
          title: props.project.title,
          description: props.project.summary,
        }}
        type='projects'
        data={props.project}
      >
        <MarkdownRender>{props.project.content}</MarkdownRender>
      </PostLayout>
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const { id } = context.params || {};
  if (!id) return { notFound: true };

  const { id: postId, title } = getPostId(id as string);
  if (!postId || !title) return { notFound: true };

  const data = await supabase
    .from('projects')
    .select('*, stacks:master_stack(*), comments:comments(*, reply_to:reply_to(*))')
    .match({
      id: postId,
    })
    .single();

  if (data.error) throw new Error(data.error.message);
  if (data.count === 0) return { notFound: true };

  const dataResponse: DbProjectResponse = {
    id: data.data.id,
    title: data.data.title,
    summary: data.data.summary,
    content: data.data.content,
    created_at: data.data.created_at,
    updated_at: data.data.updated_at,
    thumbnail_url: data.data.thumbnail_url,
    source_url: data.data.source_url ?? null,
    demo_url: data.data.demo_url ?? null,
    is_featured: data.data.is_featured,
    views: data.data.views,
    stacks: data.data.stacks,
    comments: data.data.comments,
  };

  if (process.env.NODE_ENV === 'production') {
    await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL as string,
      password: process.env.ADMIN_PASSWORD as string,
    });
    if (await supabase.auth.getSession()) {
      await supabase
        .from('blogs')
        .update({ views: dataResponse.views + 1 })
        .match({
          id: dataResponse.id,
        });
    }
  }

  return {
    props: {
      project: dataResponse,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const data = await supabase.from('projects').select('id,title');
  if (data.error) throw new Error(data.error.message);
  if (data.count === 0) return { notFound: true };

  const paths = data.data.map((project) => ({
    params: {
      id: createPostId(project.id, project.title),
    },
  }));

  return {
    paths: paths ?? [],
    fallback: 'blocking',
  };
}
