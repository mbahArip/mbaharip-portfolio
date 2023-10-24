import { Card, CardBody, CardFooter, CardHeader, Chip, Image, Tooltip } from '@nextui-org/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';

import { formatRelativeDate, formatRelativeNumber } from 'utils/dataFormatter';
import getOptimizedImage from 'utils/getOptimizedImage';
import { createPostId } from 'utils/postIdHelper';

import { DbBlogResponseSummary, DbColor, DbProjectResponseSummary, DbStuffResponseSummary } from 'types/Supabase';

interface PostCardProps {
  blog?: DbBlogResponseSummary;
  project?: DbProjectResponseSummary;
  stuff?: DbStuffResponseSummary;

  forceCompact?: boolean;
}
export default function PostCard(props: PostCardProps) {
  const [data, setData] = useState<DbBlogResponseSummary | DbProjectResponseSummary | DbStuffResponseSummary | null>(
    null,
  );
  const [blur, setBlur] = useState<boolean>(true);
  const [url, setUrl] = useState<string>('' as string);
  const [type, setType] = useState<'blog' | 'project' | 'stuff' | null>(null);
  useEffect(() => {
    if (!props.blog && !props.project && !props.stuff) throw new Error('PostCard must have at least one prop');
    if (props.blog && props.project && props.stuff) throw new Error('PostCard must have only one prop');

    if (props.blog) {
      setData(props.blog);
      setType('blog');
      setUrl(`/blogs/${createPostId(props.blog.id, props.blog.title)}`);
    }
    if (props.project) {
      setData(props.project);
      setType('project');
      setUrl(`/projects/${createPostId(props.project.id, props.project.title)}`);
    } else if (props.stuff) {
      setData(props.stuff);
      setType('stuff');
      setUrl(`/3d/${createPostId(props.stuff.id, props.stuff.title)}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const allowNSFW = localStorage.getItem('allowNSFW') === 'true' ? true : false;
    if (data && 'is_nsfw' in data && !allowNSFW) {
      setBlur(data.is_nsfw);
    } else {
      setBlur(false);
    }
  }, [data]);

  if (!data) return null;

  if (props.forceCompact) {
    return (
      <Card
        isPressable
        isHoverable
        as={NextLink}
        href={url}
        classNames={{
          base: 'h-full flex',
          body: 'p-0 flex-row',
        }}
      >
        <CardBody>
          <div className='relative aspect-square h-auto w-32 flex-shrink-0 flex-grow items-center overflow-hidden rounded-medium'>
            {'is_featured' in data && data.is_featured && (
              <div className='absolute bottom-0 right-0 z-20 flex w-full items-center justify-center gap-1 bg-secondary px-2 py-1 text-small shadow-medium'>
                <Icon
                  name='Star'
                  className='fill-foreground'
                  size='xs'
                />
                <span>Featured</span>
              </div>
            )}
            {blur && (
              <div
                className='absolute left-0 top-0 z-10 flex h-full w-full  flex-col items-center justify-center gap-1 bg-background/75'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  localStorage.setItem('allowNSFW', 'true');
                  setBlur(false);
                }}
              >
                <Icon
                  name='Ban'
                  className='text-danger'
                />
                <span className='text-center text-tiny font-bold text-danger'>Marked as NSFW</span>
              </div>
            )}
            <Image
              src={getOptimizedImage(data.thumbnail_url as string, {
                width: 512,
                height: 512,
              })}
              alt={data.title}
              removeWrapper
              radius='md'
              className={twMerge(blur && 'blur-lg')}
              classNames={{
                img: twMerge('w-full h-full object-cover object-center relative z-0'),
              }}
            />
          </div>
          <div className='flex w-full flex-grow flex-col gap-1 overflow-x-hidden px-4 py-2'>
            <h5>{data.title}</h5>
            <p className='line-clamp-2 flex-grow text-small text-default-500'>
              {data.summary} Lorem ipsum dolor sit amet consectetur, adipisicing elit. Maxime, sapiente neque quo nisi
              optio corporis temporibus ullam. Aperiam necessitatibus iusto ab perspiciatis laborum rem! Optio earum
              dolore officiis velit similique?
            </p>
            <div className='mb-1 flex w-full items-center gap-2 overflow-x-auto'>
              {'stacks' in data && (
                <>
                  {data.stacks.map((stack) => (
                    <Tooltip
                      key={stack.id}
                      className='text-tiny'
                      content={stack.name}
                      placement='top'
                    >
                      <Image
                        removeWrapper
                        src={getOptimizedImage(stack.icon_url, {
                          width: 32,
                          height: 32,
                        })}
                        alt={stack.name}
                        className='h-4 w-4'
                      />
                    </Tooltip>
                  ))}
                </>
              )}
              {'tags' in data && (
                <>
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
                </>
              )}
              {'is_images' in data && (
                <div className='flex items-center gap-2'>
                  <Tooltip
                    className='text-tiny'
                    isDisabled={!data.is_images}
                    content={`Contains images`}
                  >
                    <div className='flex items-center gap-1'>
                      <Icon
                        name='Image'
                        size='sm'
                        className={twMerge(data.is_images ? 'text-secondary' : 'text-default-200')}
                      />
                    </div>
                  </Tooltip>

                  <Tooltip
                    className='text-tiny'
                    isDisabled={!data.is_videos}
                    content={`Contains videos`}
                  >
                    <div className='flex items-center gap-1'>
                      <Icon
                        name='Video'
                        size='sm'
                        className={twMerge(data.is_videos ? 'text-secondary' : 'text-default-200')}
                      />
                    </div>
                  </Tooltip>

                  <Tooltip
                    className='text-tiny'
                    isDisabled={!data.is_sketchfab}
                    content={`Contains sketchfab embed`}
                  >
                    <div className='flex items-center gap-1'>
                      <Icon
                        name='Box'
                        size='sm'
                        className={twMerge(data.is_sketchfab ? 'text-secondary' : 'text-default-200')}
                      />
                    </div>
                  </Tooltip>

                  <Tooltip
                    className='text-tiny'
                    isDisabled={!data.is_nsfw}
                    content={`Marked as NSFW`}
                  >
                    <div className='flex items-center gap-1'>
                      <Icon
                        name='Ban'
                        size='sm'
                        className={twMerge(data.is_nsfw ? 'text-danger' : 'text-default-200')}
                      />
                    </div>
                  </Tooltip>
                </div>
              )}
            </div>
            <div className='flex w-full items-center justify-start gap-4 text-tiny text-default-400'>
              <Tooltip
                className='text-tiny'
                content={`Posted on ${new Date(data.created_at as string).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}`}
              >
                <div className='flex items-center gap-1'>
                  <Icon
                    name='Timer'
                    size='sm'
                  />
                  <span>{formatRelativeDate(data.created_at as string)}</span>
                </div>
              </Tooltip>
              <Tooltip
                className='text-tiny'
                content={`${data.views} views`}
              >
                <div className='flex items-center gap-1'>
                  <Icon
                    name='Eye'
                    size='sm'
                  />
                  <span>{formatRelativeNumber(data.views as number)}</span>
                </div>
              </Tooltip>
              <Tooltip
                className='text-tiny'
                content={`${data.comments} comments`}
              >
                <div className='flex items-center gap-1'>
                  <Icon
                    name='MessageSquare'
                    size='sm'
                  />
                  <span>{formatRelativeNumber(data.comments as number)}</span>
                </div>
              </Tooltip>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card
        isPressable
        isHoverable
        as={NextLink}
        href={url}
        classNames={{
          base: 'h-full flex sm:hidden',
          body: 'p-0 flex-row',
        }}
      >
        <CardBody>
          <div className='relative aspect-square h-auto w-32 flex-shrink-0 flex-grow items-center overflow-hidden rounded-medium'>
            {'is_featured' in data && data.is_featured && (
              <div className='absolute bottom-0 right-0 z-20 flex w-full items-center justify-center gap-1 bg-secondary px-2 py-1 text-small shadow-medium'>
                <Icon
                  name='Star'
                  className='fill-foreground'
                  size='xs'
                />
                <span>Featured</span>
              </div>
            )}
            {blur && (
              <div
                className='absolute left-0 top-0 z-10 flex h-full w-full  flex-col items-center justify-center gap-1 bg-background/75'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  localStorage.setItem('allowNSFW', 'true');
                  setBlur(false);
                }}
              >
                <Icon
                  name='Ban'
                  className='text-danger'
                />
                <span className='text-center text-tiny font-bold text-danger'>Marked as NSFW</span>
              </div>
            )}
            <Image
              src={getOptimizedImage(data.thumbnail_url as string, {
                width: 512,
                height: 512,
              })}
              alt={data.title}
              removeWrapper
              radius='md'
              className={twMerge(blur && 'blur-lg')}
              classNames={{
                img: twMerge('w-full h-full object-cover object-center relative z-0'),
              }}
            />
          </div>
          <div className='flex w-full flex-grow flex-col gap-1 overflow-x-hidden px-4 py-2'>
            <h5>{data.title}</h5>
            <p className='line-clamp-2 flex-grow text-small text-default-500'>
              {data.summary} Lorem ipsum dolor sit amet consectetur, adipisicing elit. Maxime, sapiente neque quo nisi
              optio corporis temporibus ullam. Aperiam necessitatibus iusto ab perspiciatis laborum rem! Optio earum
              dolore officiis velit similique?
            </p>
            <div className='mb-1 flex w-full items-center gap-2 overflow-x-auto'>
              {'stacks' in data && (
                <>
                  {data.stacks.map((stack) => (
                    <Tooltip
                      key={stack.id}
                      className='text-tiny'
                      content={stack.name}
                      placement='top'
                    >
                      <Image
                        removeWrapper
                        src={getOptimizedImage(stack.icon_url, {
                          width: 32,
                          height: 32,
                        })}
                        alt={stack.name}
                        className='h-4 w-4'
                      />
                    </Tooltip>
                  ))}
                </>
              )}
              {'tags' in data && (
                <>
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
                </>
              )}
              {'is_images' in data && (
                <div className='flex items-center gap-2'>
                  <Tooltip
                    className='text-tiny'
                    isDisabled={!data.is_images}
                    content={`Contains images`}
                  >
                    <div className='flex items-center gap-1'>
                      <Icon
                        name='Image'
                        size='sm'
                        className={twMerge(data.is_images ? 'text-secondary' : 'text-default-200')}
                      />
                    </div>
                  </Tooltip>

                  <Tooltip
                    className='text-tiny'
                    isDisabled={!data.is_videos}
                    content={`Contains videos`}
                  >
                    <div className='flex items-center gap-1'>
                      <Icon
                        name='Video'
                        size='sm'
                        className={twMerge(data.is_videos ? 'text-secondary' : 'text-default-200')}
                      />
                    </div>
                  </Tooltip>

                  <Tooltip
                    className='text-tiny'
                    isDisabled={!data.is_sketchfab}
                    content={`Contains sketchfab embed`}
                  >
                    <div className='flex items-center gap-1'>
                      <Icon
                        name='Box'
                        size='sm'
                        className={twMerge(data.is_sketchfab ? 'text-secondary' : 'text-default-200')}
                      />
                    </div>
                  </Tooltip>

                  <Tooltip
                    className='text-tiny'
                    isDisabled={!data.is_nsfw}
                    content={`Marked as NSFW`}
                  >
                    <div className='flex items-center gap-1'>
                      <Icon
                        name='Ban'
                        size='sm'
                        className={twMerge(data.is_nsfw ? 'text-danger' : 'text-default-200')}
                      />
                    </div>
                  </Tooltip>
                </div>
              )}
            </div>
            <div className='flex w-full items-center justify-start gap-4 text-tiny text-default-400'>
              <Tooltip
                className='text-tiny'
                content={`Posted on ${new Date(data.created_at as string).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}`}
              >
                <div className='flex items-center gap-1'>
                  <Icon
                    name='Timer'
                    size='sm'
                  />
                  <span>{formatRelativeDate(data.created_at as string)}</span>
                </div>
              </Tooltip>
              <Tooltip
                className='text-tiny'
                content={`${data.views} views`}
              >
                <div className='flex items-center gap-1'>
                  <Icon
                    name='Eye'
                    size='sm'
                  />
                  <span>{formatRelativeNumber(data.views as number)}</span>
                </div>
              </Tooltip>
              <Tooltip
                className='text-tiny'
                content={`${data.comments} comments`}
              >
                <div className='flex items-center gap-1'>
                  <Icon
                    name='MessageSquare'
                    size='sm'
                  />
                  <span>{formatRelativeNumber(data.comments as number)}</span>
                </div>
              </Tooltip>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card
        isPressable
        isHoverable
        as={NextLink}
        href={url}
        classNames={{
          base: 'h-full hidden sm:flex',
          header: 'h-52 overflow-hidden p-0 relative',
          body: 'p-4',
          footer: 'flex-col items-start gap-2 pt-0',
        }}
      >
        <CardHeader>
          {'is_featured' in data && data.is_featured && (
            <div className='absolute right-0 top-4 z-20 flex items-center gap-1 rounded-l-medium bg-secondary px-2 py-1 shadow-medium'>
              <Icon
                name='Star'
                className='fill-foreground'
                size='sm'
              />
              <span>Featured</span>
            </div>
          )}
          {blur && (
            <div
              className='absolute left-0 top-0 z-10 flex h-full w-full  flex-col items-center justify-center gap-1 bg-background/75'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                localStorage.setItem('allowNSFW', 'true');
                setBlur(false);
              }}
            >
              <Icon
                name='Ban'
                size='xl'
                className='text-danger'
              />
              <span className='text-large font-bold text-danger'>Marked as NSFW</span>
              <span className='text-small text-danger'>This post contains sensitive content.</span>
              <span className='text-small text-danger'>Click to allow NSFW content.</span>
            </div>
          )}
          <Image
            src={getOptimizedImage(data.thumbnail_url as string, {
              width: 512,
              height: 512,
            })}
            alt={data.title}
            removeWrapper
            className={twMerge(blur && 'blur-lg')}
            classNames={{
              img: twMerge('w-full object-cover object-center relative z-0'),
            }}
          />
        </CardHeader>
        <CardBody>
          <h4 className='text-large font-bold'>{data.title}</h4>
          <p className='mt-2 line-clamp-2 text-small text-default-500'>{data.summary}</p>
        </CardBody>
        <CardFooter>
          {'stacks' in data && (
            <div className='flex flex-wrap items-center gap-1'>
              {data.stacks.map((stack) => (
                <Tooltip
                  key={stack.id}
                  className='text-tiny'
                  content={stack.name}
                  placement='top'
                >
                  <Image
                    removeWrapper
                    src={getOptimizedImage(stack.icon_url, {
                      width: 32,
                      height: 32,
                    })}
                    alt={stack.name}
                    className='h-4 w-4'
                  />
                </Tooltip>
              ))}
            </div>
          )}
          {'is_images' in data && (
            <div className='flex items-center gap-2'>
              <Tooltip
                className='text-tiny'
                isDisabled={!data.is_images}
                content={`Contains images`}
              >
                <div className='flex items-center gap-1'>
                  <Icon
                    name='Image'
                    size='sm'
                    className={twMerge(data.is_images ? 'text-secondary' : 'text-default-200')}
                  />
                </div>
              </Tooltip>

              <Tooltip
                className='text-tiny'
                isDisabled={!data.is_videos}
                content={`Contains videos`}
              >
                <div className='flex items-center gap-1'>
                  <Icon
                    name='Video'
                    size='sm'
                    className={twMerge(data.is_videos ? 'text-secondary' : 'text-default-200')}
                  />
                </div>
              </Tooltip>

              <Tooltip
                className='text-tiny'
                isDisabled={!data.is_sketchfab}
                content={`Contains sketchfab embed`}
              >
                <div className='flex items-center gap-1'>
                  <Icon
                    name='Box'
                    size='sm'
                    className={twMerge(data.is_sketchfab ? 'text-secondary' : 'text-default-200')}
                  />
                </div>
              </Tooltip>

              <Tooltip
                className='text-tiny'
                isDisabled={!data.is_nsfw}
                content={`Marked as NSFW`}
              >
                <div className='flex items-center gap-1'>
                  <Icon
                    name='Ban'
                    size='sm'
                    className={twMerge(data.is_nsfw ? 'text-danger' : 'text-default-200')}
                  />
                </div>
              </Tooltip>
            </div>
          )}
          {'tags' in data && (
            <div className='flex flex-wrap items-center gap-1'>
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
            </div>
          )}
          <div className='flex w-full items-center gap-4 text-tiny text-default-400'>
            <Tooltip
              className='text-tiny'
              content={`Posted on ${new Date(data.created_at as string).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}`}
            >
              <div className='flex items-center gap-1'>
                <Icon
                  name='Timer'
                  size='sm'
                />
                <span>{formatRelativeDate(data.created_at as string)}</span>
              </div>
            </Tooltip>
            <Tooltip
              className='text-tiny'
              content={`${data.views} views`}
            >
              <div className='flex items-center gap-1'>
                <Icon
                  name='Eye'
                  size='sm'
                />
                <span>{formatRelativeNumber(data.views as number)}</span>
              </div>
            </Tooltip>
            <Tooltip
              className='text-tiny'
              content={`${data.comments} comments`}
            >
              <div className='flex items-center gap-1'>
                <Icon
                  name='MessageSquare'
                  size='sm'
                />
                <span>{formatRelativeNumber(data.comments as number)}</span>
              </div>
            </Tooltip>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
