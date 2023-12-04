import {
  Button,
  Chip,
  Image,
  Input,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
  Select,
  SelectItem,
  Selection,
  Spinner,
  Switch,
  Textarea,
  useDisclosure,
} from '@nextui-org/react';
import axios from 'axios';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { twMerge } from 'tailwind-merge';

import Drawer from 'components/Drawer';
import Dropzone from 'components/Dropzone';
import Icon from 'components/Icons';
import NanashiLayout from 'components/Layout/774AdminLayout';
import Link from 'components/Link';

import octokit from 'utils/client/octokit';
import supabaseServer from 'utils/client/supabase.server';
import { formatBytes } from 'utils/dataFormatter';
import getNextUIColor from 'utils/nextui-color-var';
import parseMediaUrl from 'utils/parseMediaUrl';
import { swrFetcher } from 'utils/swr';
import uploadFile, { getFileUploadKey } from 'utils/uploadFile';

import { ApiResponseError, ApiResponseSuccess, State } from 'types/Common';
import {
  DbRow,
  DbSchemaAttachment,
  DbSchemaAttachmentInsert,
  DbSchemaMasterCategory,
  DbSchemaMasterTag,
  DbSchemaPost,
  DbSchemaPostUpdate,
} from 'types/Supabase';

import toastConfig from 'config/toast';

const Editor = dynamic(() => import('components/BlockNote'), {
  ssr: false,
  loading: (props) => (
    <div className='flex h-full w-full flex-grow items-center justify-center py-4'>
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
      {props.isLoading && (
        <div className='flex h-full flex-grow flex-col items-center gap-2'>
          <Spinner color='primary' />
          <span className='text-small text-default-500'>Please wait while we initializing the editor...</span>
        </div>
      )}
    </div>
  ),
});

interface AdminPostNewProps {
  post: DbSchemaPost;
  repository: {
    name: string;
    private: boolean;
    html_url: string;
    stars: number;
    forks: number;
    watchers: number;
  }[];
  master_tag: DbRow<'master_tag'>[];
  master_cat: DbRow<'master_cat'>[];
}
export default function AdminPostNew(props: AdminPostNewProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [postState, setPostState] = useState<State>('disabled');

  const [title, setTitle] = useState<string>(props.post.title || '');
  const [content, setContent] = useState<string>(props.post.content || '');
  const [slug, setSlug] = useState<string>(props.post.slug || '');
  const [slugCheckState, setSlugCheckState] = useState<State>('disabled');
  const [summary, setSummary] = useState<string>(props.post.summary || '');
  const [isFeatured, setIsFeatured] = useState<boolean>(props.post.is_featured || false);
  const [category, setCategory] = useState<Selection>(new Set(props.post.category ? [props.post.category.id] : []));
  const [thumbnail, setThumbnail] = useState<File>();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    props.post.thumbnail_attachment
      ? parseMediaUrl(props.post.thumbnail_attachment.path, props.post.thumbnail_attachment.name)
      : '',
  );
  const [selectedThumbnail, setSelectedThumbnail] = useState<number | null>(
    props.post.thumbnail_attachment?.id || null,
  );
  const [selectedTags, setSelectedTags] = useState<DbRow<'master_tag'>[]>(props.post.tags || []);
  const [newTags, setNewTags] = useState<DbRow<'master_tag'>[]>([]);
  const [extraMetadata, setExtraMetadata] = useState<Record<string, any>>(
    (props.post.extra_metadata as Record<string, any>) || {},
  );

  const [tags, setTags] = useState<DbRow<'master_tag'>[]>(props.master_tag);
  const [filterTags, setFilterTags] = useState<string>();

  useEffect(() => {
    if (!filterTags) return setTags(props.master_tag);
    setTags(props.master_tag.filter((t) => t.title.toLowerCase().includes(filterTags.toLowerCase())));
  }, [filterTags, props.master_tag]);
  useEffect(() => {
    if (slug.length) {
      setSlugCheckState('idle');
    } else {
      setSlugCheckState('disabled');
    }
  }, [slug]);
  useEffect(() => {
    setExtraMetadata((props.post.extra_metadata as Record<string, any>) || {});
  }, [category, props.post.extra_metadata]);

  useEffect(() => {
    const isTitleValid = title.length > 0;
    const isContentValid = content.length > 0;
    const isSlugValid = slug.length > 0 ? slugCheckState === 'success' : true;
    const isSummaryValid = summary.length > 0;
    const isThumbnailValid = thumbnail || thumbnailUrl.length > 0;
    const isTagsValid = [...selectedTags, ...newTags].length > 0;
    const isCategoryValid = [...category].length > 0;

    if (
      isTitleValid &&
      isContentValid &&
      isSlugValid &&
      isSummaryValid &&
      isThumbnailValid &&
      isTagsValid &&
      isCategoryValid
    ) {
      setPostState('idle');
    } else {
      setPostState('disabled');
    }
  }, [title, content, slug, slugCheckState, summary, thumbnail, thumbnailUrl, selectedTags, newTags, category]);

  const drawer = useDisclosure();
  const modal = useDisclosure();

  const [attachmentsPage, setAttachmentsPage] = useState<number>(1);
  const attachments = useSWR<ApiResponseSuccess<DbSchemaAttachment[]>, ApiResponseError>(
    `/api/admin/attachments?page=${attachmentsPage}`,
    swrFetcher,
  );

  function metadataProjects() {
    return (
      <>
        <Select
          label='Repository'
          selectedKeys={extraMetadata.project ? [extraMetadata.project] : []}
          onSelectionChange={(key) => {
            setExtraMetadata((prev) => ({ ...prev, project: [...key][0] }));
          }}
          selectionMode='single'
          labelPlacement='outside'
          placeholder='Repository name'
          startContent={<Icon name='Github' />}
          scrollShadowProps={{
            className: 'max-h-[300px]',
          }}
        >
          {props.repository.map((repo) => (
            <SelectItem
              key={repo.html_url}
              description={
                <div className='flex gap-4'>
                  <div className='flex items-center gap-1'>
                    <Icon
                      name='Star'
                      size='xs'
                    />
                    <span className='text-tiny'>{repo.stars}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Icon
                      name='GitFork'
                      size='xs'
                    />
                    <span className='text-tiny'>{repo.forks}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Icon
                      name='Eye'
                      size='xs'
                    />
                    <span className='text-tiny'>{repo.watchers}</span>
                  </div>
                </div>
              }
              textValue={repo.name}
              startContent={<Icon name='Github' />}
            >
              <span className='flex items-center gap-2'>
                {repo.name}
                {repo.private && (
                  <Icon
                    name='Lock'
                    size='xs'
                  />
                )}
              </span>
            </SelectItem>
          ))}
        </Select>
        <Input
          label='Project Demo'
          labelPlacement='outside'
          placeholder='Enter demo url here...'
          value={extraMetadata.demo_url || ''}
          onValueChange={(value) => {
            setExtraMetadata((prev) => ({ ...prev, demo_url: value }));
          }}
          isInvalid={extraMetadata.demo_url && !extraMetadata.demo_url.startsWith('https://')}
          errorMessage={
            extraMetadata.demo_url && !extraMetadata.demo_url.startsWith('https://')
              ? 'Demo url must be a valid url'
              : undefined
          }
        />
      </>
    );
  }
  function metadata3DDesign() {
    return (
      <>
        <Switch
          size='sm'
          classNames={{
            label: 'subpixel-antialiased text-small',
            base: 'flex w-full !max-w-none h-fit items-center justify-between flex-row-reverse',
          }}
          checked={extraMetadata.is_downloadable || false}
          onValueChange={(value) => setExtraMetadata((prev) => ({ ...prev, is_downloadable: value }))}
        >
          Downloadable
        </Switch>
      </>
    );
  }

  const handlePublish = async () => {
    toast.loading('Publishing post...', {
      toastId: 'publishing',
      autoClose: false,
    });
    setPostState('loading');

    try {
      if (!session) throw new Error('You must be logged in to publish a post');

      let payload: DbSchemaPostUpdate = {
        status: 'published',
        category: [...category][0] as string,
        content,
        extra_metadata: extraMetadata,
        is_featured: isFeatured,
        newTags,
        slug,
        summary,
        tags: selectedTags,
        thumbnail_attachment: selectedThumbnail,
        title,
      };

      if (thumbnail) {
        // Upload image to r2 storage
        const url = await uploadFile(thumbnail, {
          uploadPath: 'thumbnails',
        });
        const { path, fileName } = getFileUploadKey(url);

        const payloadData: DbSchemaAttachmentInsert = {
          name: fileName,
          path: path,
          size: thumbnail.size,
        };
        const attachmentData = await axios
          .post<ApiResponseSuccess<DbSchemaAttachment>>('/api/admin/attachments', payloadData, {
            headers: {
              Authorization: session.user?.email,
            },
          })
          .then((res) => res.data);
        payload.thumbnail_attachment = attachmentData.data.id;
      }

      await axios
        .put<ApiResponseSuccess<DbSchemaPost>>(`/api/admin/posts/${props.post.id}`, payload, {
          headers: {
            Authorization: session.user?.email,
          },
        })
        .then((res) => res.data)
        .then((res) => console.log(res));

      toast.update('publishing', {
        render: `Successfully publishing post, redirecting...`,
        type: toast.TYPE.SUCCESS,
        autoClose: toastConfig.autoClose,
        isLoading: false,
      });
      setTimeout(() => {
        router.push(`/admin/posts`);
      }, 1000);
    } catch (error: any) {
      console.error(error);
      toast.update('publishing', {
        render: (
          <div className='flex flex-col'>
            <span>Failed to publish post</span>
            <span className='text-small text-default-500'>{error.response.data.error || error.message}</span>
          </div>
        ),
        type: toast.TYPE.ERROR,
        autoClose: toastConfig.autoClose,
        isLoading: false,
      });
    }
  };

  return (
    <NanashiLayout
      seo={{
        title: 'New Post',
        description: 'Create a new post',
      }}
      header={{
        title: 'New Post',
        subtitle: 'Write a new post',
      }}
      headerComponent={
        <>
          <div className='flex items-center gap-2'>
            <Button
              as={Link}
              href='/admin/posts'
              variant='light'
              color='danger'
              startContent={<Icon name='X' />}
            >
              Discard
            </Button>
            <Button
              color='secondary'
              isDisabled={postState === 'disabled'}
              isLoading={postState === 'loading'}
              startContent={postState === 'loading' ? undefined : <Icon name='Save' />}
              onPress={handlePublish}
            >
              Save
            </Button>
          </div>
        </>
      }
    >
      <div className='flex max-h-[calc(100dvh_-_7rem)] w-full flex-grow scroll-py-4 flex-col gap-4'>
        <div className='flex h-fit w-full items-center justify-between gap-3'>
          <Input
            labelPlacement='outside'
            placeholder='Enter title here...'
            variant='underlined'
            classNames={{
              inputWrapper: 'h-unit-10',
              innerWrapper: ' my-1',
              input: 'text-xl font-semibold',
            }}
            value={title}
            onValueChange={setTitle}
          />
          <Button
            isIconOnly
            variant='light'
            onPress={drawer.onOpen}
          >
            <Icon name='PanelRight' />
          </Button>
        </div>
        {/* <MarkdownEditor /> */}
        <div className='w-full flex-grow overflow-y-auto rounded-medium bg-content1 px-2 py-4'>
          <Editor
            mode='edit'
            content={content}
            onContentChange={setContent}
          />
        </div>
      </div>
      <Drawer
        placement='right'
        isOpen={drawer.isOpen}
        onOpenChange={drawer.onOpenChange}
      >
        <ModalContent>
          {(onclose) => (
            <>
              <ModalHeader>Post Settings</ModalHeader>
              <ModalBody>
                <Input
                  label='Post Slug'
                  labelPlacement='outside'
                  placeholder='Enter slug here'
                  startContent={<span className='text-small text-default-500'>/posts/</span>}
                  description={
                    'The slug is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.'
                  }
                  value={slug}
                  onValueChange={setSlug}
                  endContent={
                    <Button
                      isDisabled={slugCheckState === 'disabled'}
                      isLoading={slugCheckState === 'loading'}
                      color={
                        slugCheckState === 'success' ? 'success' : slugCheckState === 'error' ? 'danger' : 'default'
                      }
                      startContent={
                        slugCheckState === 'success' ? (
                          <Icon name='Check' />
                        ) : slugCheckState === 'error' ? (
                          <Icon name='X' />
                        ) : slugCheckState === 'loading' ? undefined : undefined
                      }
                      onPress={async () => {
                        setSlugCheckState('loading');

                        try {
                          if (!slug) throw new Error('Slug cannot be empty');
                          await axios
                            .get('/api/admin/posts/slug/check', {
                              params: {
                                slug,
                              },
                            })
                            .then((res) => res.data);

                          setSlugCheckState('success');
                        } catch (error: any) {
                          console.error(error);
                          setSlugCheckState('error');
                        }
                      }}
                    >
                      {slugCheckState === 'success' ? null : slugCheckState === 'error' ? null : 'Check'}
                    </Button>
                  }
                  classNames={{
                    inputWrapper: 'pr-0',
                  }}
                  isInvalid={slugCheckState === 'error' && slug.length > 0}
                  errorMessage={slugCheckState === 'error' ? 'Slug already exist' : undefined}
                />
                <div className='flex flex-col'>
                  <div className='flex items-center justify-between'>
                    <label className='pointer-events-none relative z-10 block max-w-full origin-top-left overflow-hidden text-ellipsis pb-1.5 pe-2 text-small text-foreground subpixel-antialiased transition-[transform,color,left,opacity] !duration-200 !ease-out will-change-auto after:ml-0.5 after:text-danger after:content-["*"] group-data-[filled-within=true]:pointer-events-auto group-data-[filled-within=true]:text-foreground motion-reduce:transition-none'>
                      Post thumbnail
                    </label>
                    <Button
                      size='sm'
                      variant='light'
                      color='primary'
                      onPress={() => modal.onOpen()}
                    >
                      Pick from Media
                    </Button>
                  </div>
                  <Dropzone
                    selectedFileState={{
                      selectedFile: thumbnail,
                      setSelectedFile: setThumbnail,
                    }}
                    defaultValue={thumbnailUrl || undefined}
                    dropzoneOptions={{
                      noClick: thumbnail || thumbnailUrl ? true : false,
                      onDrop(acceptedFiles, fileRejections, event) {
                        if (fileRejections.length) {
                          console.error(fileRejections);
                          if (fileRejections[0].errors[0].code === 'file-too-large') {
                            const bytes = fileRejections[0].file.size;
                            const errorMessage = `File is larger than ${formatBytes(bytes)}`;
                            toast.error(errorMessage);
                          } else {
                            toast.error(fileRejections[0].errors[0].message);
                          }
                          return;
                        }

                        const file = acceptedFiles[0];
                        setThumbnail(file);
                        setThumbnailUrl(URL.createObjectURL(file));
                      },
                      accept: {
                        'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                      },
                      maxFiles: 1,
                      maxSize: 4 * 1024 * 1024,
                    }}
                    onClear={() => setThumbnailUrl('')}
                  />
                </div>
                <Textarea
                  label='Post Summary'
                  labelPlacement='outside'
                  placeholder='Describe your post with a short summary...'
                  isRequired
                  minRows={2}
                  value={summary}
                  onValueChange={setSummary}
                />
                <Switch
                  size='sm'
                  classNames={{
                    label: 'subpixel-antialiased text-small',
                    base: 'flex w-full !max-w-none h-fit items-center justify-between flex-row-reverse',
                  }}
                  checked={isFeatured}
                  onValueChange={setIsFeatured}
                >
                  Is Featured
                </Switch>
                <Select
                  label='Category'
                  labelPlacement='outside'
                  isRequired
                  placeholder='Select an option'
                  selectedKeys={category}
                  onSelectionChange={setCategory}
                  selectionMode='single'
                  renderValue={(value) => {
                    const val = [...value][0].textValue;

                    const selectedCategory = props.master_cat.find((cat) => cat.id === val);
                    if (!selectedCategory) return undefined;

                    return (
                      <div className='flex items-center gap-1'>
                        <Icon
                          name='Circle'
                          size='xs'
                          style={{
                            color: selectedCategory.color || getNextUIColor('default'),
                            fill: selectedCategory.color || getNextUIColor('default'),
                          }}
                        />
                        <span>{selectedCategory.title}</span>
                      </div>
                    );
                  }}
                >
                  {props.master_cat.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      textValue={cat.id}
                      startContent={
                        <Icon
                          name='Circle'
                          size='xs'
                          style={{
                            color: cat.color || getNextUIColor('default'),
                            fill: cat.color || getNextUIColor('default'),
                          }}
                        />
                      }
                    >
                      {cat.title}
                    </SelectItem>
                  ))}
                </Select>
                {[...category][0] === 'projects' && metadataProjects()}
                {[...category][0] === '3d-or-design' && metadata3DDesign()}
                <Popover
                  aria-label='Tags select'
                  classNames={{
                    base: '!max-w-none',
                    content: 'w-[calc(25vw-1rem)] left-2 relative',
                  }}
                  placement='bottom'
                >
                  <PopoverTrigger>
                    <Input
                      label='Tags'
                      labelPlacement='outside'
                      endContent={
                        <Icon
                          name='ChevronDown'
                          size='sm'
                        />
                      }
                      value={
                        [...selectedTags, ...newTags].length > 0
                          ? `${[...selectedTags, ...newTags].length} tags selected`
                          : 'Select tags'
                      }
                      description={
                        newTags.length
                          ? `${newTags.length} of ${[...selectedTags, ...newTags].length} tags are new`
                          : 'There are no new tags'
                      }
                      onValueChange={() => {}}
                      classNames={{
                        inputWrapper: 'justify-start',
                        input: twMerge(
                          'text-start',
                          [...selectedTags, ...newTags].length > 0 ? '!text-foreground' : '!text-foreground-500',
                        ),
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent>
                    <Input
                      size='sm'
                      labelPlacement='outside'
                      placeholder='Filter tags'
                      fullWidth
                      className='my-1 w-full px-2'
                      value={filterTags}
                      onValueChange={setFilterTags}
                    />
                    <ScrollShadow className='max-h-[320px] w-full scroll-py-6 overflow-y-auto'>
                      <Listbox
                        selectedKeys={selectedTags.map((tag) => tag.id) as string[]}
                        onSelectionChange={(key) => {
                          const tags = [...key].map((tag) => tag as string);
                          setSelectedTags(props.master_tag.filter((tag) => tags.includes(tag.id)));
                        }}
                        emptyContent={
                          <span>
                            Can&apos;t find what you&apos;re looking for?
                            <Button
                              variant='light'
                              color='primary'
                              size='sm'
                              className='ml-1'
                              onPress={() => {
                                try {
                                  if (!filterTags) throw new Error('Tag name cannot be empty');
                                  const exist = props.master_tag.find(
                                    (tag) => tag.title.toLowerCase() === filterTags.toLowerCase(),
                                  );
                                  if (exist) throw new Error('Tag already exist');

                                  const randomColor = [
                                    '#3f3f46',
                                    '#006FEE',
                                    '#9353d3',
                                    '#17c964',
                                    '#f5a524',
                                    '#f31260',
                                    '#3f3f46',
                                    '#006FEE',
                                    '#9353d3',
                                    '#17c964',
                                    '#f5a524',
                                    '#f31260',
                                  ];

                                  const newTag: DbSchemaMasterTag = {
                                    id: filterTags.toLowerCase().replace(/ /g, '-'),
                                    title: filterTags,
                                    color: randomColor[Math.floor(Math.random() * randomColor.length)],
                                    description: null,
                                    slug: filterTags.toLowerCase().replace(/ /g, '-'),
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString(),
                                  };
                                  setNewTags((prev) => [...prev, newTag]);
                                  setFilterTags('');
                                } catch (error: any) {
                                  console.error(error);
                                  toast.error(error.message);
                                }
                              }}
                            >
                              Create &quot;{filterTags}&quot; tag
                            </Button>
                          </span>
                        }
                        selectionBehavior='toggle'
                        selectionMode='multiple'
                        aria-label='Tags list'
                        classNames={{
                          base: 'p-1',
                        }}
                      >
                        {tags.map((tag) => (
                          <ListboxItem
                            key={tag.id}
                            textValue={tag.title}
                            startContent={
                              <Icon
                                name='Circle'
                                size='xs'
                                style={{
                                  color: tag.color ?? getNextUIColor('default'),
                                  fill: tag.color ?? getNextUIColor('default'),
                                }}
                              />
                            }
                          >
                            {tag.title}
                          </ListboxItem>
                        ))}
                      </Listbox>
                    </ScrollShadow>
                  </PopoverContent>
                </Popover>
                <ScrollShadow className='flex max-h-[320px] flex-wrap overflow-y-auto'>
                  {selectedTags.map((tag) => (
                    <Chip
                      size='sm'
                      key={tag.id}
                      variant='dot'
                      classNames={{
                        base: 'bg-[var(--tags-bg)] !border-transparent',
                        dot: 'bg-[var(--tags-color)]',
                      }}
                      style={
                        {
                          '--tags-bg': tag.color ? `${tag.color}33` : getNextUIColor('default', 0.2),
                          '--tags-color': tag.color ?? getNextUIColor('default'),
                        } as React.CSSProperties
                      }
                      isCloseable
                      onClose={() => {
                        setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id));
                      }}
                    >
                      {tag.title}
                    </Chip>
                  ))}
                  {newTags.map((tag) => (
                    <Chip
                      size='sm'
                      key={tag.id}
                      variant='dot'
                      classNames={{
                        base: 'bg-[var(--tags-bg)] !border-transparent',
                        dot: 'bg-[var(--tags-color)]',
                      }}
                      style={
                        {
                          '--tags-bg': tag.color ? `${tag.color}33` : getNextUIColor('default', 0.2),
                          '--tags-color': tag.color ?? getNextUIColor('default'),
                        } as React.CSSProperties
                      }
                      isCloseable
                      onClose={() => {
                        setNewTags((prev) => prev.filter((t) => t.id !== tag.id));
                      }}
                    >
                      {tag.title}
                    </Chip>
                  ))}
                </ScrollShadow>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Drawer>
      <Modal
        isOpen={modal.isOpen}
        onOpenChange={modal.onOpenChange}
        classNames={{
          base: 'w-full max-w-screen-lg',
          body: 'grid place-items-center grid-cols-5 h-full max-h-[70vh] overflow-y-auto h-full',
        }}
        onClose={() => {
          setAttachmentsPage(1);
        }}
      >
        <ModalContent>
          {(onclose) => (
            <>
              <ModalHeader>Media Library</ModalHeader>
              <ModalBody>
                {attachments.isLoading || attachments.isValidating ? (
                  <div className='col-span-full grid place-items-center'>
                    <Spinner color='primary' />
                  </div>
                ) : attachments.data?.data.length ? (
                  <>
                    {attachments.data.data.map((attachment) => (
                      <div
                        key={attachment?.id}
                        className='relative aspect-square h-full w-full cursor-pointer bg-background/25'
                        onClick={() => {
                          setThumbnail(undefined);
                          setThumbnailUrl(parseMediaUrl(attachment!.path, attachment!.name));
                          setSelectedThumbnail(attachment!.id);
                          onclose();
                        }}
                      >
                        <Image
                          src={parseMediaUrl(attachment!.path, attachment!.name)}
                          alt={attachment?.name}
                          className='relative aspect-square h-full w-full object-contain'
                          isZoomed
                        />
                        <div className='pointer-events-none absolute top-0 z-20 line-clamp-2 flex h-full w-full items-end bg-gradient-to-t from-background to-transparent p-2 text-tiny'>
                          {attachment!.name}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <span className='col-span-full text-center text-small text-default-500'>No media found</span>
                )}
              </ModalBody>
              <ModalFooter>
                {(attachments.data?.pagination?.totalData || 0) > 0 && (
                  <div className='col-span-full flex w-full justify-end'>
                    <Pagination
                      total={attachments.data?.pagination?.totalPages || 1}
                      initialPage={attachmentsPage}
                      page={attachmentsPage}
                      onChange={setAttachmentsPage}
                    />
                  </div>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </NanashiLayout>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<AdminPostNewProps>> {
  const { id } = context.params as { id: string };

  const _tags = supabaseServer.from('master_tag').select('*');
  const _cats = supabaseServer.from('master_cat').select('*');
  const _post = supabaseServer
    .from('posts')
    .select('*,attachment:attachments(*),category:master_cat(*),tags:master_tag(*)')
    .eq('id', id)
    .single();
  const _repository = octokit.rest.repos
    .listForAuthenticatedUser({
      affiliation: 'owner',
      per_page: 1000,
    })
    .then((res) => res.data);
  // const _newPost = supabaseServer.from('posts').insert({status: 'draft'}).select('id').single();

  const [tags, cats, post, repository] = await Promise.all([_tags, _cats, _post, _repository]);
  if (tags.error) throw tags.error;
  if (cats.error) throw cats.error;
  if (post.error) throw post.error;

  const postData: DbSchemaPost = {
    id: post.data.id,
    created_at: post.data.created_at,
    updated_at: post.data.updated_at,
    content: post.data.content,
    extra_metadata: post.data.extra_metadata,
    is_featured: post.data.is_featured,
    slug: post.data.slug,
    status: post.data.status,
    summary: post.data.summary,
    thumbnail_attachment: post.data.attachment!,
    title: post.data.title,
    category: post.data.category as DbSchemaMasterCategory,
    tags: post.data.tags.sort((a, b) => a.id.localeCompare(b.id)) ?? [],
    count: {
      views: post.data.views,
    },
  };
  const repositoryData: {
    name: string;
    private: boolean;
    html_url: string;
    stars: number;
    forks: number;
    watchers: number;
  }[] = repository.map((repo) => ({
    name: repo.name,
    private: repo.private,
    html_url: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.watchers_count,
  }));

  return {
    props: {
      post: postData,
      repository: repositoryData,
      master_tag: tags.data,
      master_cat: cats.data,
    },
  };
}
