import { Divider } from '@nextui-org/react';
import c from 'constant';
import { motion as m } from 'framer-motion';

import DefaultLayout from 'components/Layout/DefaultLayout';
import PostCard from 'components/PostCard';

import supabase from 'utils/client/supabase';

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
}
export default function ProjectsPage(props: ProjectsPageProps) {
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
        className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
      >
        {props.projects.map((project) => (
          <m.div
            variants={cardItem}
            key={project.id}
          >
            <PostCard project={project} />
          </m.div>
        ))}
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
    .order('created_at', { ascending: false });

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
    },
  };
}
