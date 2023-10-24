import { GetStaticPropsContext } from 'next';

import PostLayout from 'components/Layout/PostLayout';
import MarkdownRender from 'components/MarkdownRender';

import supabase from 'utils/client/supabase';
import { createPostId, getPostId } from 'utils/postIdHelper';

import { DbBlogResponse } from 'types/Supabase';

interface BlogDetailsProps {
  blog: DbBlogResponse;
}
export default function BlogDetails(props: BlogDetailsProps) {
  return (
    <>
      <PostLayout
        seo={{
          title: props.blog.title,
          description: props.blog.summary,
        }}
        type='blogs'
        data={props.blog}
      >
        <MarkdownRender>{props.blog.content}</MarkdownRender>
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
    .from('blogs')
    .select('*, tags:master_tag(*), comments:comments(*, reply_to:reply_to(*))')
    .match({
      id: postId,
    })
    .single();

  if (data.error) throw new Error(data.error.message);
  if (data.count === 0) return { notFound: true };

  const dataResponse: DbBlogResponse = {
    id: data.data.id,
    title: data.data.title,
    summary: data.data.summary,
    content: data.data.content,
    created_at: data.data.created_at,
    updated_at: data.data.updated_at,
    thumbnail_url: data.data.thumbnail_url,

    is_featured: data.data.is_featured,
    views: data.data.views,
    tags: data.data.tags,
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
      blog: dataResponse,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const data = await supabase.from('blogs').select('id,title');
  if (data.error) throw new Error(data.error.message);
  if (data.count === 0) return { notFound: true };

  const paths = data.data.map((blog) => ({
    params: {
      id: createPostId(blog.id, blog.title),
    },
  }));

  return {
    paths: paths ?? [],
    fallback: 'blocking',
  };
}
