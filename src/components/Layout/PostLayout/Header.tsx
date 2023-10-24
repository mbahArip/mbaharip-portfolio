import { Chip, Image, Tooltip } from '@nextui-org/react';
import c from 'constant';
import { motion } from 'framer-motion';

import Icon from 'components/Icons';
import Link from 'components/Link';

import { formatDate, formatRelativeDate } from 'utils/dataFormatter';
import getOptimizedImage from 'utils/getOptimizedImage';

import { DbBlogResponse, DbColor, DbProjectResponse, DbStuffResponse } from 'types/Supabase';

const titleContainer = {
  hidden: {
    opacity: 1,
  },
  show: {
    opacity: 1,
    transition: {
      delay: c.ANIM_DELAY * 0,
      when: 'beforeChildren',
      staggerChildren: 0.125,
    },
  },
};
const titleItem = {
  hidden: {
    opacity: 0,
    x: '-25%',
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
    },
  },
};

interface PostLayoutHeaderProps {
  type: 'projects' | 'blogs' | 'stuff';
  data: DbProjectResponse | DbBlogResponse | DbStuffResponse;
  comments: number;
}

export default function PostLayoutHeader({ data, type, comments }: PostLayoutHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
      }}
      className='relative left-0 top-0 z-20 h-[50vh] w-full lg:h-[65vh]'
    >
      <Image
        src={getOptimizedImage(data.thumbnail_url, {
          width: 1920,
          height: 1080,
        })}
        alt={data.title}
        removeWrapper
        loading='eager'
        radius='none'
        classNames={{
          img: 'w-full h-full object-cover',
        }}
      />
      <div className='absolute left-0 top-0 z-10 h-full w-full bg-gradient-to-b from-transparent via-background/75 to-background' />
      <div className='center-max-xl absolute left-1/2 top-20 z-20 -translate-x-1/2 px-2'>
        <Link
          href={`/${type === 'stuff' ? '3d' : type}`}
          className='w-fit gap-1 rounded-medium bg-primary-50/50 px-2 backdrop-blur'
        >
          <Icon name='ArrowLeftCircle' />
          <span>Back</span>
        </Link>
      </div>
      <motion.div
        variants={titleContainer}
        initial={'hidden'}
        animate={'show'}
        className='center-max-xl absolute bottom-8 left-1/2 z-20 flex w-full -translate-x-1/2 flex-col gap-2 px-2'
      >
        <motion.div
          variants={titleItem}
          className='flex flex-col flex-wrap items-start gap-2'
        >
          {'is_featured' in data && data.is_featured && (
            <Chip
              size='sm'
              variant='shadow'
              color='secondary'
              classNames={{
                base: 'px-1 h-fit',
                content: 'text-tiny',
              }}
            >
              Featured
            </Chip>
          )}
          <h1 className='line-clamp-2 text-2xl md:text-3xl lg:text-4xl'>{data.title}</h1>
        </motion.div>
        <motion.span
          variants={titleItem}
          className='text-default-500'
        >
          {data.summary}
        </motion.span>
        {'source_url' in data && 'demo_url' in data && (
          <motion.div
            variants={titleItem}
            className='flex items-center gap-4'
          >
            {(data as DbProjectResponse).source_url && (
              <Link
                href={(data as DbProjectResponse).source_url as string}
                isExternal
                showAnchorIcon
              >
                <Icon
                  name='Github'
                  size='sm'
                  className='mr-1'
                />
                <span>Source Code</span>
              </Link>
            )}
            {(data as DbProjectResponse).demo_url && (
              <Link
                href={(data as DbProjectResponse).demo_url as string}
                isExternal
                showAnchorIcon
              >
                <Icon
                  name='Globe'
                  size='sm'
                  className='mr-1'
                />
                <span>Live View</span>
              </Link>
            )}
          </motion.div>
        )}
        <motion.span
          variants={titleItem}
          className='flex flex-col text-small text-default-400'
        >
          <span>
            Posted {formatRelativeDate(data.created_at)} ({formatDate(data.created_at)})
          </span>
          <div className='flex items-center gap-4'>
            <span className='flex items-center gap-1'>
              <Icon
                name='Eye'
                size='sm'
              />
              {data.views} views
            </span>
            <span className='flex items-center gap-1'>
              <Icon
                name='MessageSquare'
                size='sm'
              />
              {comments} comments
            </span>
          </div>
        </motion.span>
        {'stacks' in data && (
          <motion.div
            variants={titleItem}
            className='flex flex-wrap items-center gap-2'
          >
            <span className='text-tiny'>Built using</span>
            {data.stacks.map((stack) => (
              <Tooltip
                content={stack.name}
                key={stack.id}
              >
                <Image
                  src={stack.icon_url}
                  alt={stack.name}
                  width={20}
                  height={20}
                  radius='none'
                  loading='eager'
                  className='inline-block'
                />
              </Tooltip>
            ))}
          </motion.div>
        )}
        {'tags' in data && (
          <motion.div
            variants={titleItem}
            className='flex flex-wrap items-center gap-2'
          >
            <span className='text-tiny'>Tags</span>
            {data.tags.map((tag) => (
              <Chip
                key={tag.id}
                size='sm'
                variant='flat'
                color={tag.color ? (tag.color as DbColor) : 'default'}
                classNames={{
                  base: 'px-1 h-fit',
                  content: 'text-tiny',
                }}
              >
                {tag.name}
              </Chip>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
