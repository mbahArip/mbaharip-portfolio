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
import { DbProjectResponseSummary } from 'types/Supabase';

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
interface ProjectsPageProps {
  projects: DbProjectResponseSummary[];
  totalData: number;
}
export default function ProjectsPage(props: ProjectsPageProps) {
  const [loadMoreState, setLoadMoreState] = useState<State>('idle');
  const [data, setData] = useState<DbProjectResponseSummary[]>(props.projects);
  const [page, setPage] = useState<number>(1);
  const [isNextPage, setIsNextPage] = useState<boolean>(props.projects.length < props.totalData);

  const handleNextPage = async () => {
    setLoadMoreState('loading');
    try {
      const qPage = page + 1;
      const pagination = buildPagination(qPage, 1);
      const res = await supabase
        .from('projects')
        .select(
          'id,created_at,updated_at,title,summary,is_featured,views,thumbnail_url,comments:comments(count),stacks:master_stack(*)',
          {
            count: 'exact',
          },
        )
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .range(pagination.from, pagination.to);

      if (res.error) throw new Error(res.error.message);

      const projectResponse: DbProjectResponseSummary[] = res.data
        ? res.data.map((project) => ({
            id: project.id,
            created_at: project.created_at,
            updated_at: project.updated_at,
            title: project.title,
            summary: project.summary,
            thumbnail_url: project.thumbnail_url,
            is_featured: project.is_featured,
            views: project.views,
            comments: (project.comments[0] as any).count,
            stacks: project.stacks,
          }))
        : [];

      const newData = [...data, ...projectResponse];

      setData(newData);
      setPage(qPage);
      setIsNextPage(newData.length < props.totalData);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load more projects');
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
          <h1>Projects</h1>
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
            Projects I&apos;ve worked on.
          </m.span>
        </div>
      </div>
      <Divider />
      <m.div
        variants={cardContainer}
        initial={'hidden'}
        animate={'show'}
        className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
      >
        {data.map((project) => (
          <m.div
            variants={cardItem}
            key={project.id}
          >
            <PostCard project={project} />
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
    .from('projects')
    .select(
      'id,created_at,updated_at,title,summary,is_featured,views,thumbnail_url,comments:comments(count),stacks:master_stack(*)',
      {
        count: 'exact',
      },
    )
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(0, 24);

  if (res.error) throw new Error(res.error.message);

  const projectResponse: DbProjectResponseSummary[] = res.data
    ? res.data.map((project) => ({
        id: project.id,
        created_at: project.created_at,
        updated_at: project.updated_at,
        title: project.title,
        summary: project.summary,
        thumbnail_url: project.thumbnail_url,
        is_featured: project.is_featured,
        views: project.views,
        comments: (project.comments[0] as any).count,
        stacks: project.stacks,
      }))
    : [];

  return {
    props: {
      projects: projectResponse,
      totalData: res.count ?? 0,
    },
  };
}
