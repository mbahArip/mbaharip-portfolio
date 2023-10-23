import { Avatar, Button, Chip, Divider, Image, Tooltip } from '@nextui-org/react';
import c from 'constant';
import { motion as m } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';
import DefaultLayout from 'components/Layout/DefaultLayout';
import Link from 'components/Link';
import PostCard from 'components/PostCard';

import { useSettings } from 'contexts/settings';
import octokit from 'utils/client/octokit';
import supabase from 'utils/client/supabase';

import { GithubProfile } from 'types/Api';
import { DbBlogResponseSummary, DbProjectResponseSummary, DbStuffResponseSummary } from 'types/Supabase';

import dataSocials from 'data/socials';

import { Get_ProfileAbout } from './api/profile/about';

const socialContainer = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      delay: c.ANIM_DELAY * 2.5,
      when: 'beforeChildren',
      staggerChildren: 0.125,
    },
  },
};
const socialItem = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeInOut',
      type: 'tween',
    },
  },
};

const aboutContainer = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      delay: c.ANIM_DELAY * 4,
      when: 'beforeChildren',
      staggerChildren: 0.25,
    },
  },
};
const aboutItem = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
      type: 'tween',
    },
  },
};

const latestContainer = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      delay: c.ANIM_DELAY * 5,
      when: 'beforeChildren',
      staggerChildren: 0.25,
    },
  },
};
const latestItem = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
      type: 'tween',
    },
  },
};

const mockStuff: DbStuffResponseSummary[] = [
  {
    id: '1',
    title: 'Test',
    summary: 'loremipsumdolorsitamet',
    comments: 24,
    views: 123,
    is_nsfw: true,
    is_images: true,
    is_videos: false,
    is_sketchfab: true,
    tags: [
      {
        id: '1',
        name: 'Test',
        color: 'primary',
        created_at: '2021-08-01T00:00:00.000Z',
        updated_at: '2021-08-01T00:00:00.000Z',
      },
    ],
    thumbnail_url: 'https://i.imgur.com/0Q6VX9B.jpeg',
    created_at: '2021-08-01T00:00:00.000Z',
    updated_at: '2021-08-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Test sfw',
    summary: 'loremipsumdolorsitamet',
    comments: 24,
    views: 123,
    is_nsfw: false,
    is_images: true,
    is_videos: true,
    is_sketchfab: false,
    tags: [],
    thumbnail_url: 'https://i.imgur.com/0Q6VX9B.jpeg',
    created_at: '2021-08-01T00:00:00.000Z',
    updated_at: '2021-08-01T00:00:00.000Z',
  },
];

interface IHomeProps {
  users: GithubProfile;
  about: string;
  latestBlog: DbBlogResponseSummary[];
  latestProject: DbProjectResponseSummary[];
  latest3D: DbStuffResponseSummary[];
}
export default function Home({ users, about, latestProject, latestBlog, latest3D }: IHomeProps) {
  const settings = useSettings();
  return (
    <DefaultLayout
      seo={{
        title: 'Home',
      }}
      defaultState='loading'
    >
      {/* Avatar and banner */}
      <div className='center-max-md relative -mb-12 w-full'>
        <Image
          src='/api/profile/banner'
          alt='banner'
          removeWrapper
          className='h-32 w-full object-cover md:h-48'
        />
        <div className='absolute top-0 z-30 h-32 w-full bg-gradient-to-t from-background to-transparent md:h-48' />
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
            type: 'tween',
            delay: c.ANIM_DELAY * 1,
          }}
          className='relative -top-12 z-40 mx-auto flex flex-col items-center justify-center gap-2'
        >
          <Avatar
            src={users.avatar_url}
            alt={users.name}
            size='lg'
            color='primary'
            classNames={{
              base: 'w-16 h-16 md:w-24 md:h-24',
            }}
            isBordered
          />
          <div className='flex w-full flex-col items-center'>
            <m.span
              initial={{ opacity: 0, x: '25%' }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
                type: 'tween',
                delay: c.ANIM_DELAY * 2,
              }}
              className='text-large font-bold'
            >
              {users.name}
            </m.span>
            <m.span
              initial={{ opacity: 0, x: '-25%' }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
                type: 'tween',
                delay: c.ANIM_DELAY * 2,
              }}
              className='text-default-600'
            >
              {users.bio}
            </m.span>
            <div className='relative flex h-full w-full flex-col py-6'>
              <m.div
                initial={{ opacity: 0, y: '25%', x: '-50%' }}
                animate={{ opacity: settings.isHireable ? 1 : 0, y: settings.isHireable ? 0 : '25%', x: '-50%' }}
                transition={{
                  duration: 0.25,
                  type: 'tween',
                  delay: c.ANIM_DELAY * 2,
                }}
                className={twMerge(
                  'pointer-events-auto absolute left-1/2 top-0 z-10 my-2',
                  !settings.isHireable && 'pointer-events-none',
                )}
              >
                <Chip
                  as={Link}
                  href='/contact'
                  variant='faded'
                  size='sm'
                  color={'success'}
                  classNames={{
                    content: 'font-semibold',
                  }}
                  startContent={<div className='mx-1 h-2 w-2 animate-pulse rounded-full bg-success' />}
                >
                  I&apos;m available for hire
                </Chip>
              </m.div>
              <m.div
                initial={{ opacity: 0, y: '25%', x: '-50%' }}
                animate={{ opacity: !settings.isHireable ? 1 : 0, y: !settings.isHireable ? 0 : '25%', x: '-50%' }}
                transition={{
                  duration: 0.25,
                  type: 'tween',
                  delay: c.ANIM_DELAY * 2,
                }}
                className={twMerge('pointer-events-auto absolute left-1/2 top-0 my-2')}
              >
                <Chip
                  as={Link}
                  href='/contact'
                  isDisabled
                  variant='faded'
                  size='sm'
                  color={'danger'}
                  classNames={{
                    content: 'font-semibold',
                  }}
                  startContent={
                    <Icon
                      name='X'
                      size='sm'
                      className='mx-1 rounded-full text-danger'
                    />
                  }
                >
                  Busy at the moment
                </Chip>
              </m.div>
            </div>
          </div>
        </m.div>
      </div>

      {/* Links */}
      <m.div
        variants={socialContainer}
        initial='hidden'
        animate='show'
        className='center-max-md flex w-full flex-wrap items-center justify-center gap-4'
      >
        {dataSocials.map((social) => {
          const Icon = social.icon;
          return (
            <Tooltip
              content={social.name}
              key={social.name}
              placement='bottom'
              showArrow
            >
              <m.div variants={socialItem}>
                <Button
                  as={Link}
                  href={social.href}
                  isExternal
                  isIconOnly
                  variant='light'
                  radius='full'
                  size='md'
                  className={`group p-0 hover:opacity-100`}
                >
                  <Icon
                    className={`icon ${social.name.toLowerCase()}`}
                    size={40}
                  />
                </Button>
              </m.div>
            </Tooltip>
          );
        })}
      </m.div>

      {/* About */}
      <m.div
        variants={aboutContainer}
        initial={'hidden'}
        animate={'show'}
        className='flex flex-col items-center gap-2'
      >
        <m.p
          variants={aboutItem}
          dangerouslySetInnerHTML={{ __html: about }}
          className='center-max-md flex flex-col items-center gap-2 text-center'
        ></m.p>
        <m.div
          variants={aboutItem}
          className='flex items-center gap-1'
        >
          Learn more about me <Link href='/about'>here</Link>
        </m.div>
      </m.div>

      {/* Latest blog posts */}
      <m.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
          type: 'tween',
          delay: c.ANIM_DELAY * 4,
        }}
        className='flex flex-col gap-4 py-4 md:py-8'
      >
        <div className='flex items-center justify-between'>
          <m.h3
            initial={{
              opacity: 0,
              x: -40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              type: 'tween',
              delay: c.ANIM_DELAY * 4.5,
            }}
          >
            Latest blog posts
          </m.h3>
          <m.div
            initial={{
              opacity: 0,
              x: 40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              type: 'tween',
              delay: c.ANIM_DELAY * 4.5,
            }}
          >
            <Link href='/blogs'>View all</Link>
          </m.div>
        </div>
        <m.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
            type: 'tween',
            delay: c.ANIM_DELAY * 4.5,
          }}
        >
          <Divider />
        </m.div>
        <m.div
          variants={latestContainer}
          initial={'hidden'}
          animate={'show'}
          className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        >
          {latestBlog.length === 0 ? (
            <span className='col-span-full py-8 text-center text-default-400'>
              Looks like there are no blog posts yet
            </span>
          ) : (
            <>
              {latestBlog.length === 0 ? (
                <span className='col-span-full py-8 text-center text-default-400'>
                  Looks like there are no projects yet
                </span>
              ) : (
                <>
                  {latestBlog.map((blog) => (
                    <m.div
                      key={blog.id}
                      variants={latestItem}
                    >
                      <PostCard blog={blog} />
                    </m.div>
                  ))}
                </>
              )}
            </>
          )}
        </m.div>
      </m.div>

      {/* Latest projects */}
      <m.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
          type: 'tween',
          delay: c.ANIM_DELAY * 4,
        }}
        className='flex flex-col gap-4 py-4 md:py-8'
      >
        <div className='flex items-center justify-between'>
          <m.h3
            initial={{
              opacity: 0,
              x: -40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              type: 'tween',
              delay: c.ANIM_DELAY * 4.5,
            }}
          >
            Latest projects
          </m.h3>
          <m.div
            initial={{
              opacity: 0,
              x: 40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              type: 'tween',
              delay: c.ANIM_DELAY * 4.5,
            }}
          >
            <Link href='/projects'>View all</Link>
          </m.div>
        </div>
        <m.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
            type: 'tween',
            delay: c.ANIM_DELAY * 4.5,
          }}
        >
          <Divider />
        </m.div>
        <m.div
          variants={latestContainer}
          initial={'hidden'}
          animate={'show'}
          className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        >
          {latestProject.length === 0 ? (
            <span className='col-span-full py-8 text-center text-default-400'>
              Looks like there are no projects yet
            </span>
          ) : (
            <>
              {latestProject.map((project) => (
                <m.div
                  key={project.id}
                  variants={latestItem}
                >
                  <PostCard project={project} />
                </m.div>
              ))}
            </>
          )}
        </m.div>
      </m.div>

      {/* Latest stuff */}
      <m.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
          type: 'tween',
          delay: c.ANIM_DELAY * 4,
        }}
        className='flex flex-col gap-4 py-4 md:py-8'
      >
        <div className='flex items-center justify-between'>
          <m.h3
            initial={{
              opacity: 0,
              x: -40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              type: 'tween',
              delay: c.ANIM_DELAY * 4.5,
            }}
          >
            Latest 3D and stuff
          </m.h3>
          <m.div
            initial={{
              opacity: 0,
              x: 40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              type: 'tween',
              delay: c.ANIM_DELAY * 4.5,
            }}
          >
            <Link href='/3d'>View all</Link>
          </m.div>
        </div>
        <m.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
            type: 'tween',
            delay: c.ANIM_DELAY * 4.5,
          }}
        >
          <Divider />
        </m.div>
        <m.div
          variants={latestContainer}
          initial={'hidden'}
          animate={'show'}
          className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        >
          {latest3D.length === 0 ? (
            <span className='col-span-full py-8 text-center text-default-400'>
              Looks like there are no 3D and stuff yet
            </span>
          ) : (
            <>
              {latest3D.map((stuff) => (
                <m.div
                  key={stuff.id}
                  variants={latestItem}
                >
                  <PostCard stuff={stuff} />
                </m.div>
              ))}
            </>
          )}
        </m.div>
      </m.div>
    </DefaultLayout>
  );
}

export async function getServerSideProps() {
  const _user = octokit.rest.users.getAuthenticated();
  const _about = Get_ProfileAbout();
  const _project = supabase
    .from('projects')
    .select(
      'id,created_at,updated_at,title,summary,is_featured,views,thumbnail_url,comments:comments(count),stacks:master_stack(*)',
      {
        count: 'exact',
      },
    )
    .order('created_at', { ascending: false })
    .limit(4);
  const _blog = supabase
    .from('blogs')
    .select(
      'id,created_at,updated_at,title,summary,is_featured,views,thumbnail_url,comments:comments(count),tags:master_tag(*)',
      {
        count: 'exact',
      },
    )
    .order('created_at', { ascending: false })
    .limit(4);
  const _stuff = supabase
    .from('stuff')
    .select(
      'id,created_at,updated_at,title,summary,is_nsfw,views,thumbnail_url,image_urls,video_urls,sketchfab_url,comments:comments(count),tags:master_tag(*)',
      {
        count: 'exact',
      },
    )
    .order('created_at', { ascending: false })
    .limit(4);

  const [user, project, blog, stuff, about] = await Promise.all([_user, _project, _blog, _stuff, _about]);
  if (project.error) throw new Error('Failed to fetch latest project');
  if (blog.error) throw new Error('Failed to fetch latest blog');
  if (stuff.error) throw new Error('Failed to fetch latest 3D and stuff');

  const blogResponse: DbBlogResponseSummary[] = blog.data
    ? blog.data.map((blog) => ({
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
  const projectResponse: DbProjectResponseSummary[] = project.data
    ? project.data.map((project) => ({
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
  const stuffResponse: DbStuffResponseSummary[] = stuff.data
    ? stuff.data.map((stuff) => ({
        id: stuff.id,
        created_at: stuff.created_at,
        updated_at: stuff.updated_at,
        title: stuff.title,
        summary: stuff.summary,
        thumbnail_url: stuff.thumbnail_url,
        views: stuff.views,
        comments: (stuff.comments[0] as any).count,
        tags: stuff.tags,
        is_nsfw: stuff.is_nsfw,
        is_images: stuff.image_urls ? stuff.image_urls.length > 0 : false,
        is_videos: stuff.video_urls ? stuff.video_urls.length > 0 : false,
        is_sketchfab: stuff.sketchfab_url ? true : false,
      }))
    : [];

  return {
    props: {
      users: user.data as GithubProfile,
      about: about,
      latestBlog: blogResponse,
      latestProject: projectResponse,
      latest3D: stuffResponse,
    },
  };
}
