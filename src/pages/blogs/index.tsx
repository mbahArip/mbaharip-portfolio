import { Button, Divider } from '@nextui-org/react';
import c from 'constant';
import { motion as m } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'react-toastify';

import DefaultLayout from 'components/Layout/DefaultLayout';
import PostCard from 'components/PostCard';

import supabase from 'utils/client/supabase';
import { buildPagination } from 'utils/supabaseHelper';

import { State } from 'types/Common';
import { DbBlogResponseSummary } from 'types/Supabase';

const cardContainer = {
  hidden: {
    opacity: 1,
  },
  show: {
    opacity: 1,
    transition: {
      delay: c.ANIM_DELAY * 1,
      when: 'beforeChildren',
      staggerChildren: 0.125,
    },
  },
};
const cardItem = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
    },
  },
};
interface BlogsPageProps {
  blogs: DbBlogResponseSummary[];
  totalData: number;
}
export default function BlogsPage(props: BlogsPageProps) {
  const [loadMoreState, setLoadMoreState] = useState<State>('idle');
  const [data, setData] = useState<DbBlogResponseSummary[]>(props.blogs);
  const [page, setPage] = useState<number>(1);
  const [isNextPage, setIsNextPage] = useState<boolean>(props.blogs.length < props.totalData);

  const handleNextPage = async () => {
    setLoadMoreState('loading');
    try {
      const qPage = page + 1;
      const pagination = buildPagination(qPage, 1);
      const res = await supabase
        .from('blogs')
        .select(
          'id,created_at,updated_at,title,summary,is_featured,views,thumbnail_url,comments:comments(count),tags:master_tag(*)',
          {
            count: 'exact',
          },
        )
        .order('created_at', { ascending: false })
        .range(pagination.from, pagination.to);

      if (res.error) throw new Error(res.error.message);

      const blogResponse: DbBlogResponseSummary[] = res.data
        ? res.data.map((blog) => ({
            id: blog.id,
            created_at: blog.created_at,
            updated_at: blog.updated_at,
            title: blog.title,
            summary: blog.summary,
            thumbnail_url: blog.thumbnail_url,
            is_featured: blog.is_featured,
            views: blog.views,
            comments: (blog.comments[0] as any).count,
            tags: blog.tags,
          }))
        : [];

      const newData = [...data, ...blogResponse];

      setData(newData);
      setPage(qPage);
      setIsNextPage(newData.length < props.totalData);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load more blogs');
    } finally {
      setLoadMoreState('idle');
    }
  };

  return (
    <DefaultLayout
      seo={{
        title: 'Projects',
      }}
    >
      {/* Header */}
      <div className='center-max-xl flex flex-col items-center justify-center gap-8'>
        <div className='flex w-full flex-col items-start'>
          <h1>Blogs</h1>
          <m.span
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.75,
              ease: 'easeInOut',
              type: 'tween',
            }}
            className='text-small text-default-500'
          >
            Posts about my journey and experience or just random thoughts.
          </m.span>
        </div>
      </div>
      <Divider />
      <m.div
        variants={cardContainer}
        initial={'hidden'}
        animate={'show'}
        className='grid grid-cols-1 gap-4 md:grid-cols-2'
      >
        {data.map((blog) => (
          <m.div
            variants={cardItem}
            key={blog.id}
          >
            <PostCard
              blog={blog}
              forceCompact
            />
          </m.div>
        ))}
        {isNextPage && (
          <Button
            size='lg'
            variant='faded'
            color='primary'
            className='col-span-full mt-4'
            isDisabled={loadMoreState === 'disabled'}
            isLoading={loadMoreState === 'loading'}
            onPress={handleNextPage}
          >
            Load More Projects
          </Button>
        )}
      </m.div>
    </DefaultLayout>
  );
}

export async function getServerSideProps() {
  const res = await supabase
    .from('blogs')
    .select(
      'id,created_at,updated_at,title,summary,is_featured,views,thumbnail_url,comments:comments(count),tags:master_tag(*)',
      {
        count: 'exact',
      },
    )
    .order('created_at', { ascending: false })
    .range(0, 24);

  if (res.error) throw new Error(res.error.message);

  const blogResponse: DbBlogResponseSummary[] = res.data
    ? res.data.map((blog) => ({
        id: blog.id,
        created_at: blog.created_at,
        updated_at: blog.updated_at,
        title: blog.title,
        summary: blog.summary,
        thumbnail_url: blog.thumbnail_url,
        is_featured: blog.is_featured,
        views: blog.views,
        comments: (blog.comments[0] as any).count,
        tags: blog.tags,
      }))
    : [];

  return {
    props: {
      blogs: blogResponse,
      totalData: res.count ?? 0,
    },
  };
}
