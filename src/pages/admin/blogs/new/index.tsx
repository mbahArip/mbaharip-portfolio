import {
  Button,
  Chip,
  Divider,
  Image,
  Input,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
  Spinner,
  Textarea,
} from '@nextui-org/react';
import { GetServerSidePropsResult } from 'next';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { requestCreateBlog } from 'supabase/controller/Blogs.client';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';
import AdminLayout from 'components/Layout/AdminLayout';
import Link from 'components/Link';

import supabase from 'utils/client/supabase';
import getNextUIColor from 'utils/nextui-color-var';
import uploadFile from 'utils/uploadFile';

import { State } from 'types/Common';
import { DbBlogCreate, DbColor, DbMasterTagResponse } from 'types/Supabase';

const Editor = dynamic(() => import('components/MarkdownEditor'), {
  ssr: false,
  loading: (props) => (
    <div className='flex w-full items-center justify-center py-4'>
      {props.error && (
        <div className='flex flex-col items-center'>
          <span className='text-large text-danger'>Error loading editor</span>
          <p className='text-small text-default-500'>
            {props.error.name}: {props.error.message}
          </p>
          <pre className='w-full rounded-medium bg-background/25 px-3 py-2 text-small'>
            <code className='whitespace-pre-wrap'>{JSON.stringify(props.error.stack, null, 2)}</code>
          </pre>
        </div>
      )}
      {props.isLoading && <Spinner color='primary' />}
    </div>
  ),
});

interface AdminBlogsNewProps {
  master_tags: DbMasterTagResponse[];
}
export default function AdminBlogsNew(props: AdminBlogsNewProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [tags, setTags] = useState<DbMasterTagResponse[]>(props.master_tags);
  const [filterTags, setFilterTags] = useState<string>('');

  const [blogTitle, setBlogTitle] = useState<string>('');
  const [blogSummary, setBlogSummary] = useState<string>('');
  const [blogContent, setBlogContent] = useState<string>('');
  const [blogThumbnail, setBlogThumbnail] = useState<File | null>(null);
  const [thumbnailInputRef, setThumbnailInputRef] = useState<HTMLInputElement | null>(null);
  const [blogTags, setBlogTags] = useState<DbMasterTagResponse[]>([]);
  const [blogNewTags, setBlogNewTags] = useState<DbMasterTagResponse[]>([]);
  const [publishBtnState, setPublishBtnState] = useState<State>('disabled');

  useEffect(() => {
    if (!filterTags) setTags(props.master_tags);
    else setTags(props.master_tags.filter((tag) => tag.name.toLowerCase().includes(filterTags.toLowerCase())));
  }, [filterTags, props.master_tags]);

  useEffect(() => {
    const isTitleFilled = blogTitle.length > 0;
    const isSummaryFilled = blogSummary.length > 0;
    const isContentFilled = blogContent.length > 0;
    const isThumbnailFilled = !!blogThumbnail;
    const isTagsFilled = blogTags.length > 0 || blogNewTags.length > 0;

    if (isTitleFilled && isSummaryFilled && isContentFilled && isThumbnailFilled && isTagsFilled)
      setPublishBtnState('idle');
    else setPublishBtnState('disabled');
  }, [blogTitle, blogSummary, blogContent, blogThumbnail, blogTags, blogNewTags]);

  const handlePublish = async () => {
    setPublishBtnState('loading');
    try {
      if (!session) throw new Error('You must be logged in to publish a post');
      if (!blogThumbnail) throw new Error('Thumbnail is required');

      // Upload thumbnail to discord
      const thumbnailUrl = await uploadFile(blogThumbnail);
      if (!thumbnailUrl) throw new Error('Failed to upload thumbnail');
      const thumbnail_url = new URL(thumbnailUrl);
      thumbnail_url.searchParams.forEach((_, key) => {
        thumbnail_url.searchParams.delete(key);
      });

      // Send request to supabase via API
      const payload: DbBlogCreate & {
        tags: string;
        newTags?: string;
      } = {
        title: blogTitle,
        summary: blogSummary,
        content: blogContent,
        thumbnail_url: thumbnail_url.toString(),
        tags: JSON.stringify(blogTags),
        newTags: blogNewTags.length ? JSON.stringify(blogNewTags) : undefined,
      };
      await requestCreateBlog(payload, session);

      toast.success('Successfully published post');
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(router.push('/admin/blogs'));
        }, 500),
      );
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setPublishBtnState('idle');
    }
  };

  return (
    <AdminLayout
      seo={{
        title: 'New Post',
        description: 'Create a new blog post',
      }}
      icon='Plus'
      showTitle={false}
      className='flex-grow p-0'
      removeGap
    >
      <div className='relative flex w-full flex-grow'>
        <aside className='top-22 fixed left-0 z-50 flex h-full max-h-screen w-[20vw] flex-col justify-between gap-4 border-r border-divider bg-content1 p-4 pb-28 shadow-medium'>
          <div className='flex h-fit w-full flex-col gap-4'>
            <div className='flex flex-col'>
              <label className='block origin-top-left pb-1.5 text-small font-medium text-foreground transition-all !duration-200 !ease-out will-change-auto motion-reduce:transition-none'>
                Post thumbnail
              </label>
              <div className='group relative aspect-[1200/630] h-fit w-full rounded-medium bg-background/25'>
                <input
                  ref={setThumbnailInputRef}
                  type='file'
                  hidden
                  accept='image/*'
                  onChange={(e) => {
                    if (!e.target.files?.length) return;

                    const file = e.target.files[0];
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    if (!file.type.startsWith('image/')) {
                      toast.error('File must be an image');
                      return;
                    }
                    if (file.size > maxSize) {
                      toast.error('File size is too large, please select a file smaller than 5MB');
                      return;
                    }

                    setBlogThumbnail(file);
                  }}
                />
                <div
                  className='absolute left-0 top-0 z-20 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-medium bg-background opacity-0 transition group-hover:opacity-80'
                  onClick={() => {
                    if (thumbnailInputRef) thumbnailInputRef.click();
                  }}
                >
                  <Icon name='ImagePlus' />
                  <span className='text-tiny'>Click here to select a thumbnail</span>
                </div>
                <Image
                  src={blogThumbnail ? URL.createObjectURL(blogThumbnail) : undefined}
                  alt='Thumbnail'
                  removeWrapper
                  className='relative z-10 aspect-[1200/630] h-full w-full object-cover'
                />
                <span className='absolute left-0 top-0 z-0 grid h-full w-full place-items-center'>
                  No thumbnail selected
                </span>
              </div>
              <span className='mt-1 text-tiny text-default-400'>Recommended size: 1200x630 (16:9) | Max size: 5MB</span>
              <span className='text-tiny text-default-400'>Will be uploaded when save</span>
            </div>
            <Textarea
              label={'Post summary'}
              labelPlacement='outside'
              placeholder={'Explain what this post is about'}
              isMultiline
              minRows={5}
              value={blogSummary}
              onValueChange={setBlogSummary}
            />
            <div className='flex w-full flex-col'>
              <label className='block origin-top-left pb-1.5 text-small font-medium text-foreground transition-all !duration-200 !ease-out will-change-auto motion-reduce:transition-none'>
                Post tags
              </label>
              <Popover
                placement='right-start'
                offset={8}
                classNames={{
                  base: 'px-3 py-2 w-[19rem] fixed',
                }}
                motionProps={{
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  transition: {
                    duration: 0.125,
                    ease: 'easeInOut',
                    type: 'tween',
                  },
                }}
                onClose={() => setFilterTags('')}
              >
                <PopoverTrigger>
                  <Button
                    startContent={<Icon name='Tag' />}
                    endContent={<Icon name='ChevronDown' />}
                    className='justify-between'
                  >
                    {blogTags.length || blogNewTags.length
                      ? `${blogTags.length + (blogNewTags.length ?? 0)} tags selected`
                      : 'Select tags'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='gap-2'>
                  <Input
                    autoFocus
                    size='sm'
                    placeholder='Search for tags'
                    value={filterTags}
                    onValueChange={setFilterTags}
                    isClearable
                    onClear={() => setFilterTags('')}
                    startContent={
                      <Icon
                        name='Search'
                        size='sm'
                      />
                    }
                  />
                  <Divider />
                  {tags.length ? (
                    <ScrollShadow className='max-h-[360px] w-full max-w-[19rem]'>
                      <Listbox
                        selectionMode='multiple'
                        selectedKeys={[...new Set(blogTags.map((tag) => tag.id))]}
                        onSelectionChange={(keys) => {
                          setBlogTags(
                            [...keys].map((key) => tags.find((tag) => tag.id === key) as DbMasterTagResponse),
                          );
                        }}
                      >
                        {tags.map((tag) => (
                          <ListboxItem
                            key={tag.id}
                            variant='flat'
                            startContent={
                              <div
                                className='h-2 w-2 rounded-full'
                                style={{
                                  backgroundColor: getNextUIColor(tag.color as DbColor),
                                }}
                              />
                            }
                          >
                            {tag.name}
                          </ListboxItem>
                        ))}
                      </Listbox>
                    </ScrollShadow>
                  ) : (
                    <>
                      <span className='text-small text-default-500'>No tags found</span>
                      {!blogNewTags.find((tag) => tag.name.toLowerCase() === filterTags.toLowerCase()) && (
                        <span
                          onClick={() => {
                            const color = ['primary', 'secondary', 'success', 'warning', 'error', 'default'];

                            const newTag: DbMasterTagResponse = {
                              id: filterTags.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                              name: filterTags.substring(0, 1).toUpperCase() + filterTags.substring(1),
                              color: color[Math.floor(Math.random() * color.length)] as DbColor,
                              created_at: new Date().toISOString(),
                              updated_at: new Date().toISOString(),
                            };

                            setBlogNewTags((prev) => [...prev, newTag]);
                            setFilterTags('');
                          }}
                          className='cursor-pointer text-tiny text-primary'
                        >
                          Click here to create the tag
                        </span>
                      )}
                    </>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            <div className='flex flex-wrap gap-1'>
              {[...blogTags, ...blogNewTags]
                .sort((a, b) => a.id.localeCompare(b.id))
                .map((tag) => (
                  <Chip
                    key={tag.id}
                    size='sm'
                    color={tag.color as DbColor}
                    variant='dot'
                    isCloseable
                    onClose={() => {
                      const isNewTag = blogNewTags.find((t) => t.id === tag.id);

                      if (isNewTag) setBlogNewTags((prev) => prev.filter((t) => t.id !== tag.id));
                      else setBlogTags((prev) => prev.filter((t) => t.id !== tag.id));
                    }}
                    classNames={{
                      base: twMerge(blogNewTags.find((t) => t.id === tag.id) && 'border-success'),
                    }}
                  >
                    {tag.name}
                  </Chip>
                ))}
            </div>
          </div>

          <div className='flex w-full flex-col gap-2'>
            <Button
              as={Link}
              href='/admin/blogs'
              fullWidth
              variant='flat'
              color='danger'
              size='sm'
            >
              Discard post
            </Button>
            <Button
              fullWidth
              variant='shadow'
              color='secondary'
              startContent={publishBtnState !== 'loading' && <Icon name='Save' />}
              isDisabled={publishBtnState === 'disabled'}
              isLoading={publishBtnState === 'loading'}
              onPress={handlePublish}
            >
              Publish post
            </Button>
          </div>
        </aside>
        <div className='flex-grow'>
          <div className='relative left-[20vw] h-full w-[80vw] overflow-x-hidden px-16 py-4'>
            <div className='center-max-xl flex h-full flex-grow flex-col gap-4 rounded-medium bg-content1 py-4'>
              <Input
                variant='underlined'
                placeholder='Enter post title'
                value={blogTitle}
                onValueChange={setBlogTitle}
                size='lg'
                classNames={{
                  base: 'max-h-fit pl-12',
                  // inputWrapper: 'py-2',
                  input: 'text-4xl font-bold py-2',
                }}
              />
              <Editor
                mode='edit'
                content={blogContent}
                onContentChange={(content) => {
                  function replaceAllUnsafeLink(data: string) {
                    // create url regex that check wether it's https, http, ftp, or even without protocol or subdomain
                    let jsonData = data;
                    const urlRegex = /"href"\s*:\s*"([^"]*)"/gm;
                    const match = data.match(urlRegex);
                    if (match) {
                      const urls = match.map((url) => url.replace(/"href"\s*:\s*"([^"]*)"/gm, '$1'));
                      for (const url of urls) {
                        if (url.startsWith('/') || url.startsWith('#')) continue;
                        const safeURL = `${window.location.origin}/redirect?url=${encodeURIComponent(url)}`;
                        jsonData = jsonData.replace(url, safeURL);
                      }
                    }
                    return jsonData;
                  }
                  setBlogContent(replaceAllUnsafeLink(content));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(): Promise<GetServerSidePropsResult<AdminBlogsNewProps>> {
  const masterTags = await supabase.from('master_tag').select('*').order('name', { ascending: true });
  if (masterTags.error) throw new Error(masterTags.error.message);

  return {
    props: {
      master_tags: masterTags.data,
    },
  };
}
