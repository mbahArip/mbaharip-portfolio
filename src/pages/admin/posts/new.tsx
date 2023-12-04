import { GetServerSidePropsResult } from 'next';

import supabaseServer from 'utils/client/supabase.server';

export default function AdminPostNew() {
  return null;
}

export async function getServerSideProps(): Promise<GetServerSidePropsResult<{}>> {
  const newPost = await supabaseServer.from('posts').insert({ status: 'draft' }).select('id').single();
  if (newPost.error) throw newPost.error;

  return {
    redirect: {
      destination: `/admin/posts/${newPost.data.id}`,
      permanent: false,
    },
  };
}
