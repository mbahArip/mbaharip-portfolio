import {
  Button,
  ButtonGroup,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Input,
  Listbox,
  ListboxItem,
  Modal,
  ModalContent,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
  Select,
  SelectItem,
  Selection,
  SortDescriptor,
  Tooltip,
  useDisclosure,
} from '@nextui-org/react';
import axios from 'axios';
import c from 'constant';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR, { mutate } from 'swr';
import { twMerge } from 'tailwind-merge';
import { ArrayParam, BooleanParam, NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';

import { ErrorToast, SuccessToast } from 'components/DetailedToast';
import ErrorPage from 'components/Error';
import Icon from 'components/Icons';
import NanashiLayout from 'components/Layout/774AdminLayout';
import Link from 'components/Link';
import Loading from 'components/Loading';
import TableContent, { TableContentColumnProps, TableContentRowProps } from 'components/TableContent';
import TableActions, { TableAction } from 'components/TableContent/TableActions';

import { DeleteContent, DeleteSelectedContent, ViewSelectedContent } from 'mod/admin/posts';

import useDebounce from 'hooks/useDebouce';
import supabaseClient from 'utils/client/supabase.client';
import { formatDate } from 'utils/dataFormatter';
import getNextUIColor from 'utils/nextui-color-var';
import parseMediaUrl from 'utils/parseMediaUrl';
import { swrFetcher } from 'utils/swr';

import { ApiResponseSuccess } from 'types/Common';
import { DbEnum, DbGetOptions, DbRow, DbSchemaMasterCategory, DbSchemaMasterTag, DbSchemaPost } from 'types/Supabase';

import toastConfig from 'config/toast';

type MasterWithCount<T> = T & { count: number };

const contentColumn: TableContentColumnProps<DbSchemaPost>[] = [
  {
    key: 'is_featured',
    label: 'FEATURED',
    hide: true,
    width: 24,
  },
  {
    key: 'thumbnail_attachment',
    label: 'THUMBNAIL',
    width: 128,
  },
  {
    key: 'title',
    label: 'TITLE',
    allowSort: true,
    width: 320,
  },
  {
    key: 'summary',
    label: 'SUMMARY',
  },
  {
    key: 'category',
    label: 'CATEGORY',
    allowSort: true,
    width: 96,
  },
  {
    key: 'status',
    label: 'STATUS',
    allowSort: true,
    width: 96,
  },
  {
    key: 'created_at',
    label: 'CREATED AT',
    allowSort: true,
    width: 240,
  },
];

interface AdminPostsProps {
  fallbackQuery?: Partial<DbGetOptions<'posts'>>;
  master_tag: MasterWithCount<DbSchemaMasterTag>[];
  master_cat: MasterWithCount<DbSchemaMasterCategory>[];
}

export default function AdminPosts(props: AdminPostsProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [q, setQ] = useQueryParams(
    {
      page: withDefault(NumberParam, props.fallbackQuery?.page ?? 1),
      rowsPerPage: withDefault(NumberParam, props.fallbackQuery?.rowsPerPage ?? c.ITEMS_PER_PAGE),
      order: withDefault(StringParam, props.fallbackQuery?.order ?? 'desc'),
      orderBy: withDefault(StringParam, props.fallbackQuery?.orderBy ?? 'created_at'),
      category: withDefault(StringParam, props.fallbackQuery?.category ?? undefined),
      query: withDefault(StringParam, props.fallbackQuery?.query ?? undefined),
      status: withDefault(StringParam, props.fallbackQuery?.status ?? undefined),
      tags: withDefault(ArrayParam, props.fallbackQuery?.tags ?? undefined),
      is_featured: withDefault(BooleanParam, props.fallbackQuery?.is_featured ?? undefined),
    },
    {
      removeDefaultsFromUrl: true,
      skipUpdateWhenNoChange: true,
      updateType: 'replaceIn',
    },
  );

  const [query, setQuery] = useState<string>(q.query || '');
  const debouncedQuery = useDebounce(query);

  const [tags, setTags] = useState<MasterWithCount<DbSchemaMasterTag>[]>(props.master_tag);
  const [tagsFilter, setTagsFilter] = useState<string>('');

  const [sort, setSort] = useState<SortDescriptor>({
    column: q.orderBy as keyof DbRow<'posts'>,
    direction: q.order === 'asc' ? 'ascending' : 'descending',
  });

  useEffect(() => {
    if (!query) setQ({ query: undefined });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  useEffect(() => {
    if (!debouncedQuery) return;
    setQ({ query: debouncedQuery });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  useEffect(() => {
    if (!tagsFilter) return setTags(props.master_tag);
    setTags(props.master_tag.filter((tag) => tag.title.toLowerCase().includes(tagsFilter.toLowerCase())));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsFilter]);

  useEffect(() => {
    setQ({
      order: sort.direction === 'ascending' ? 'asc' : 'desc',
      orderBy: sort.column as string,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const [selectedRows, setSelectedRows] = useState<Selection>(new Set([]));

  const [modalView, setModalView] = useState<'view-selected' | 'export-selected' | 'delete-selected' | 'delete-single'>(
    'view-selected',
  );
  const [modalItem, setModalItem] = useState<DbSchemaPost>();
  const modal = useDisclosure();

  const [errorData, setErrorData] = useState<any>();
  const data = useSWR<ApiResponseSuccess<DbSchemaPost[]>>(
    () => {
      const filteredSearchParams = Object.fromEntries(
        Object.entries(q).filter(([_, v]) => v !== undefined && v !== null),
      );
      const params = new URLSearchParams(filteredSearchParams as any);

      return `/api/admin/posts?${params.toString()}`;
    },
    swrFetcher,
    {
      onError(err, key, config) {
        setErrorData(err);
      },
    },
  );
  const selectedData = useSWR<ApiResponseSuccess<DbSchemaPost[]>>(
    `/api/admin/posts?ids=${[...selectedRows].join(',')}`,
    swrFetcher,
    {
      onError(err, key, config) {
        setErrorData(err);
      },
    },
  );

  if ((data.error || selectedData.error) && errorData) {
    return (
      <ErrorPage
        status={errorData.response?.status ?? 500}
        code={errorData.code}
        name={errorData.response.data.message || errorData.name}
        message={errorData.response.data.error || errorData.message}
      />
    );
  }

  // Table Content goes here
  const contentRow: TableContentRowProps<DbSchemaPost>[] = [
    {
      key: 'is_featured',
      render(item) {
        return (
          <Tooltip content={item.is_featured ? 'Remove from featured' : 'Set as featured'}>
            <Button
              variant='light'
              isIconOnly
              onPress={async () => {
                const toastId = `update-post-featured-${item.id}`;
                toast.loading('Updating featured...', {
                  autoClose: false,
                  toastId,
                });

                try {
                  const newIsFeatured = item.is_featured ? false : true;
                  await axios.put(
                    `/api/admin/posts/${item.id}`,
                    {
                      is_featured: newIsFeatured,
                    },
                    {
                      headers: {
                        Authorization: session?.user?.email,
                      },
                    },
                  );

                  data.mutate();
                  toast.update(toastId, {
                    render: `${item.title} is now ${newIsFeatured ? 'featured' : 'not featured'}`,
                    type: toast.TYPE.SUCCESS,
                    autoClose: toastConfig.autoClose,
                    isLoading: false,
                  });
                } catch (error: any) {
                  console.error(error);
                  toast.update(toastId, {
                    render: (
                      <div className='flex flex-col'>
                        <span>Failed to update featured</span>
                        <span className='text-small text-default-500'>
                          {error.response.data.error || error.message}
                        </span>
                      </div>
                    ),
                    type: toast.TYPE.ERROR,
                    autoClose: toastConfig.autoClose,
                    isLoading: false,
                  });
                }
              }}
            >
              <Icon
                name='Star'
                className={twMerge(
                  item.is_featured ? 'fill-primary text-primary' : 'text-default-foreground',
                  'transition !duration-150',
                )}
              />
            </Button>
          </Tooltip>
        );
      },
    },
    {
      key: 'thumbnail_attachment',
      render(item) {
        return (
          <Image
            src={
              item.thumbnail_attachment
                ? parseMediaUrl(item.thumbnail_attachment.path, item.thumbnail_attachment.name)
                : c.PLACEHOLDER_IMAGE
            }
            alt={item.thumbnail_attachment ? item.thumbnail_attachment.name : 'No thumbnail'}
            radius='sm'
            removeWrapper
            className='h-full max-h-14 w-full object-contain'
          />
        );
      },
    },
    {
      key: 'title',
      render(item) {
        return <span className='font-semibold'>{item.title}</span>;
      },
    },
    {
      key: 'summary',
      render(item) {
        return <span className='text-default-500'>{item.summary || 'No summary'}</span>;
      },
    },
    {
      key: 'category',
      render(item) {
        return (
          <span>
            {item.category ? (
              <Chip
                size='sm'
                key={item.category.id}
                variant='dot'
                classNames={{
                  base: 'bg-[var(--chip-bg)] !border-transparent',
                  dot: 'bg-[var(--chip-color)]',
                }}
                style={
                  {
                    '--chip-bg': item.category.color ? `${item.category.color}33` : getNextUIColor('default', 0.2),
                    '--chip-color': item.category.color ?? getNextUIColor('default'),
                  } as React.CSSProperties
                }
              >
                {item.category.title}
              </Chip>
            ) : (
              <span className='text-tiny text-default-500'>Uncategorized</span>
            )}
          </span>
        );
      },
    },
    {
      key: 'status',
      render(item) {
        return (
          <span>
            <Chip
              size='sm'
              key={item.status}
              variant='dot'
              classNames={{
                base: 'bg-[var(--chip-bg)] !border-transparent',
                dot: 'bg-[var(--chip-color)]',
              }}
              style={
                {
                  '--chip-bg':
                    item.status === 'published'
                      ? getNextUIColor('success', 0.2)
                      : item.status === 'draft'
                      ? getNextUIColor('warning', 0.2)
                      : item.status === 'unpublished'
                      ? getNextUIColor('danger', 0.2)
                      : getNextUIColor('default', 0.2),
                  '--chip-color':
                    item.status === 'published'
                      ? getNextUIColor('success')
                      : item.status === 'draft'
                      ? getNextUIColor('warning')
                      : item.status === 'unpublished'
                      ? getNextUIColor('danger')
                      : getNextUIColor('default'),
                } as React.CSSProperties
              }
            >
              {item.status === 'published'
                ? 'Published'
                : item.status === 'draft'
                ? 'Draft'
                : item.status === 'unpublished'
                ? 'Archived'
                : 'Flagged'}
            </Chip>
          </span>
        );
      },
    },
    {
      key: 'created_at',
      render(item) {
        return (
          <span>
            {formatDate(item.updated_at, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },
  ];
  const contentActions: (item: DbSchemaPost) => TableAction[] = (item: DbSchemaPost) => [
    {
      key: 'edit',
      label: 'Edit post',
      icon: 'Pencil',
      description: 'Edit this post',
      onAction() {
        router.push(`/admin/posts/${item.id}`);
      },
    },
    {
      key: 'copy-url',
      label: 'Copy post URL',
      icon: 'Copy',
      description: 'Copy this post URL to clipboard',
      async onAction() {
        try {
          const safeUrlTitle =
            item.title
              .replaceAll(' ', '-')
              .replaceAll(/[^a-zA-Z0-9-]/g, '')
              .toLowerCase() + `.${item.id}`;
          await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_DOMAIN}/posts/${item.slug || safeUrlTitle}`);
          toast.success('Copied post URL to clipboard');
        } catch (error: any) {
          console.error(error);
          toast.error('Failed to copy post URL to clipboard');
        }
      },
    },
    {
      key: 'status',
      label: item.status === 'published' ? 'Archive post' : 'Publish post',
      icon: item.status === 'published' ? 'Archive' : 'ArchiveRestore',
      description: item.status === 'published' ? 'Archive this post' : 'Publish this post',
      color: item.status === 'published' ? 'warning' : 'success',
      className: item.status === 'published' ? 'text-warning' : 'text-success',
      async onAction() {
        const toastId = `update-post-status-${item.id}`;
        toast.loading('Updating status...', {
          autoClose: false,
          toastId,
        });

        try {
          const newStatus = item.status === 'published' ? 'unpublished' : 'published';
          await axios.put(
            `/api/admin/posts/${item.id}`,
            {
              status: newStatus,
            },
            {
              headers: {
                Authorization: session?.user?.email,
              },
            },
          );

          data.mutate();
          mutate('/api/admin/count', undefined, true);
          toast.update(toastId, {
            render: <SuccessToast message='Status updated' />,
            type: toast.TYPE.SUCCESS,
            autoClose: toastConfig.autoClose,
            isLoading: false,
          });
        } catch (error: any) {
          console.error(error);
          toast.update(toastId, {
            render: (
              <ErrorToast
                message='Failed to update status'
                details={error.response.data.error || error.message}
              />
            ),
            type: toast.TYPE.ERROR,
            autoClose: toastConfig.autoClose,
            isLoading: false,
          });
        }
      },
    },
    {
      key: 'delete',
      label: 'Delete post',
      icon: 'Trash',
      description: 'Delete this post',
      color: 'danger',
      className: 'text-danger',
      onAction() {
        setModalView('delete-single');
        setModalItem(item);
        modal.onOpen();
      },
    },
  ];

  return (
    <NanashiLayout
      seo={{
        title: 'Posts',
      }}
      header={{
        title: 'Posts',
        subtitle: 'Manage posts on the website',
      }}
    >
      {!data ? (
        <Loading />
      ) : (
        <div className='flex w-full flex-grow flex-col gap-3'>
          <div className='flex w-full'>
            <div className='flex w-full items-center justify-between'>
              <div className='flex flex-grow items-center gap-2'>
                <Tooltip content={q.is_featured ? 'Show all posts' : 'Show featured posts only'}>
                  <Button
                    isIconOnly
                    variant={q.is_featured ? 'shadow' : 'flat'}
                    className='bg-default-100'
                    onPress={() => {
                      if (q.is_featured) setQ({ is_featured: undefined });
                      else setQ({ is_featured: true });
                    }}
                  >
                    <Icon
                      name='Star'
                      className={twMerge(
                        q.is_featured ? 'fill-primary text-primary' : 'text-default-foreground',
                        'transition !duration-150',
                      )}
                    />
                  </Button>
                </Tooltip>
                <Input
                  labelPlacement='outside'
                  placeholder='Search posts...'
                  value={query}
                  onValueChange={setQuery}
                  startContent={<Icon name='Search' />}
                  className={'max-w-sm'}
                  isClearable
                  onClear={() => {
                    setQuery('');
                    setQ({ query: undefined });
                  }}
                />
                <Select
                  aria-label='Status'
                  labelPlacement='outside'
                  placeholder='Filter status'
                  selectedKeys={q.status ? new Set([q.status]) : new Set([])}
                  onSelectionChange={(keys) => {
                    const key = [...keys][0];
                    setQ({ status: key as string });
                  }}
                  selectionMode='single'
                  renderValue={(value) => {
                    return (
                      <div className='flex items-center gap-2'>
                        <Icon
                          name='Circle'
                          size='xs'
                          className={
                            value[0].textValue === 'Published'
                              ? 'fill-success text-success'
                              : value[0].textValue === 'Draft'
                              ? 'fill-warning text-warning'
                              : value[0].textValue === 'Archived'
                              ? 'fill-danger text-danger'
                              : 'fill-default text-default'
                          }
                        />
                        <span>{value[0].textValue}</span>
                      </div>
                    );
                  }}
                  className='max-w-xs'
                >
                  <SelectItem
                    aria-label='Published'
                    key={'published'}
                    textValue='Published'
                    startContent={
                      <Icon
                        name='Circle'
                        size='xs'
                        className='fill-success text-success'
                      />
                    }
                  >
                    Published
                  </SelectItem>
                  <SelectItem
                    aria-label='Draft'
                    key={'draft'}
                    textValue='Draft'
                    startContent={
                      <Icon
                        name='Circle'
                        size='xs'
                        className='fill-warning text-warning'
                      />
                    }
                  >
                    Draft
                  </SelectItem>
                  <SelectItem
                    aria-label='Archived'
                    key={'unpublished'}
                    textValue='Archived'
                    startContent={
                      <Icon
                        name='Circle'
                        size='xs'
                        className='fill-danger text-danger'
                      />
                    }
                  >
                    Archived
                  </SelectItem>
                </Select>
                <Select
                  aria-label='Category'
                  labelPlacement='outside'
                  placeholder='Filter category'
                  selectedKeys={q.category ? new Set([q.category]) : new Set([])}
                  onSelectionChange={(keys) => {
                    const key = [...keys][0];
                    setQ({ category: key as string });
                  }}
                  selectionMode='single'
                  renderValue={(value) => {
                    const category = props.master_cat.find((cat) => cat.id === value[0].textValue);
                    return (
                      <div className='flex items-center gap-2'>
                        <Icon
                          name='Circle'
                          size='xs'
                          style={{
                            color: category?.color ?? getNextUIColor('default'),
                            fill: category?.color ?? getNextUIColor('default'),
                          }}
                        />
                        <span>{category?.title ?? value[0].textValue}</span>
                      </div>
                    );
                  }}
                  className='max-w-xs'
                >
                  {props.master_cat.map((category) => (
                    <SelectItem
                      aria-label={category.title}
                      key={category.id}
                      textValue={category.id}
                      startContent={
                        <Icon
                          name='Circle'
                          size='xs'
                          style={{
                            color: category?.color ?? getNextUIColor('default'),
                            fill: category?.color ?? getNextUIColor('default'),
                          }}
                        />
                      }
                      endContent={<span className='text-tiny text-default-500'>{category.count ?? 0}</span>}
                    >
                      {category.title}
                    </SelectItem>
                  ))}
                </Select>
                <Popover
                  placement='bottom'
                  aria-label='Tags'
                  classNames={{
                    base: 'w-[20rem] flex-grow',
                    content: 'w-full overflow-hidden bg-content1 flex-grow gap-2 p-1 relative left-2',
                    trigger: 'text-start !cursor-pointer',
                  }}
                  onClose={() => setTagsFilter('')}
                >
                  <PopoverTrigger>
                    <Input
                      labelPlacement='outside'
                      className='max-w-xs'
                      endContent={
                        <Icon
                          name='ChevronDown'
                          size='sm'
                        />
                      }
                      value={
                        q.tags && q.tags.length
                          ? Array.isArray(q.tags)
                            ? `${q.tags.length} tags selected`
                            : '1 tag selected'
                          : 'Filter tags'
                      }
                      onValueChange={() => {}}
                      classNames={{
                        inputWrapper:
                          'justify-start !cursor-pointer [&_div:has(input[aria-expanded=true])_>_svg]:rotate-180',
                        input: twMerge(
                          'text-start !cursor-pointer',
                          q.tags && q.tags.length ? '!text-foreground' : '!text-foreground-500',
                        ),
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent>
                    <Input
                      size='sm'
                      labelPlacement='outside'
                      placeholder='Search tags'
                      fullWidth
                      className='my-1 w-full max-w-xs px-2'
                      value={tagsFilter}
                      onValueChange={setTagsFilter}
                    />
                    <ScrollShadow className='max-h-[320px] w-full scroll-py-6 overflow-y-auto'>
                      <Listbox
                        selectedKeys={
                          q.tags
                            ? new Set(q.tags && Array.isArray(q.tags) ? (q.tags as string[]) : ([q.tags] as string[]))
                            : new Set()
                        }
                        onSelectionChange={(key) => {
                          const tags = [...key].map((tag) => tag as string);
                          setQ({ tags: tags.length ? tags : undefined });
                        }}
                        emptyContent='No tags found'
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
                            endContent={<span className='text-tiny text-default-500'>{tag.count ?? 0}</span>}
                          >
                            {tag.title}
                          </ListboxItem>
                        ))}
                      </Listbox>
                    </ScrollShadow>
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                variant='shadow'
                color='primary'
                as={Link}
                href='/admin/posts/new'
                startContent={<Icon name='Plus' />}
              >
                New Post
              </Button>
            </div>
          </div>

          {data.data ? (
            <TableContent
              key={'content'}
              columns={contentColumn}
              rows={contentRow}
              items={(data.data.data as DbSchemaPost[]) || []}
              emptyContent='No posts found'
              isLoading={data.isLoading || data.isValidating}
              actions={(item) => <TableActions actions={contentActions(item)} />}
              tableProps={{
                'aria-label': 'Data table',
                'selectedKeys': selectedRows,
                'onSelectionChange': (keys) => {
                  if (keys === 'all') {
                    if (data.data) {
                      setSelectedRows(new Set(data.data.data.map((item) => item!.id)));
                    } else {
                      setSelectedRows(new Set([]));
                    }
                  } else {
                    setSelectedRows(keys);
                  }
                },
                'selectionMode': 'multiple',
                'sortDescriptor': sort,
                'onSortChange': setSort,
                'topContent': (
                  <div className='flex w-full items-center justify-between gap-4'>
                    <span className='text-tiny text-default-500'>
                      Showing {data.data.data.length} of {data.data.pagination?.totalData ?? 0} posts
                    </span>
                    <Select
                      label='Rows per page'
                      labelPlacement='outside-left'
                      selectedKeys={new Set([String(q.rowsPerPage ?? c.ITEMS_PER_PAGE)])}
                      onSelectionChange={(keys) => {
                        const key = [...keys][0];
                        setQ({
                          page: 1,
                          rowsPerPage: Number(key),
                        });
                      }}
                      selectionMode='single'
                      className='max-w-xs'
                      classNames={{
                        base: 'items-center',
                        label: 'whitespace-nowrap',
                      }}
                    >
                      <SelectItem
                        aria-label='10'
                        key={'10'}
                        textValue={'10 rows'}
                      >
                        10 rows
                      </SelectItem>
                      <SelectItem
                        aria-label='20'
                        key={'20'}
                        textValue={'20 rows'}
                      >
                        20 rows
                      </SelectItem>
                      <SelectItem
                        aria-label='50'
                        key={'50'}
                        textValue={'50 rows'}
                      >
                        50 rows
                      </SelectItem>
                      <SelectItem
                        aria-label='100'
                        key={'100'}
                        textValue={'100 rows'}
                      >
                        100 rows
                      </SelectItem>
                    </Select>
                  </div>
                ),
                'bottomContent': (
                  <div className='flex w-full items-center justify-between gap-4'>
                    <ButtonGroup
                      size='sm'
                      variant='flat'
                      isDisabled={[...selectedRows].length === 0}
                    >
                      <Button
                        onPress={() => {
                          setModalView('view-selected');
                          modal.onOpen();
                        }}
                      >
                        {[...selectedRows].length ? `${[...selectedRows].length} posts selected` : 'No selected post'}
                      </Button>
                      <Dropdown aria-label='Selected action'>
                        <DropdownTrigger>
                          <Button isIconOnly>
                            <Icon
                              name='ChevronDown'
                              size='sm'
                            />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label='Selected action menu'
                          onAction={(key) => {
                            switch (key) {
                              case 'delete-selected':
                                setModalView('delete-selected');
                                modal.onOpen();
                                break;
                              default:
                                toast.error('Invalid action');
                                break;
                            }
                          }}
                        >
                          <DropdownItem
                            aria-label='Delete posts'
                            key={'delete-selected'}
                            description='Delete selected posts'
                            startContent={<Icon name='Trash' />}
                            color='danger'
                            className='text-danger'
                          >
                            Delete selected
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </ButtonGroup>
                    <Pagination
                      isCompact
                      size='sm'
                      initialPage={q.page ?? 1}
                      page={q.page ?? 1}
                      total={data.data.pagination?.totalPages ?? 1}
                      onChange={(page) =>
                        setQ({
                          page,
                        })
                      }
                    />
                  </div>
                ),
              }}
            />
          ) : (
            <Loading />
          )}
        </div>
      )}
      <Modal
        isOpen={modal.isOpen}
        onOpenChange={modal.onOpenChange}
        classNames={{
          base: 'max-w-screen-xl w-fit min-w-[30vw]',
          footer: 'justify-between gap-32',
        }}
      >
        <ModalContent>
          {(onclose) => (
            <>
              {modalView === 'view-selected' && (
                <ViewSelectedContent
                  data={selectedData.data ? (selectedData.data.data as DbSchemaPost[]) : []}
                  isLoading={selectedData.isLoading}
                  onClose={onclose}
                />
              )}
              {modalView === 'delete-selected' && (
                <DeleteSelectedContent
                  data={selectedData.data ? (selectedData.data.data as DbSchemaPost[]) : []}
                  isLoading={selectedData.isLoading}
                  onClose={onclose}
                  callback={() => {
                    data.mutate();
                    mutate('/api/admin/count', undefined, true);
                    setSelectedRows(new Set([]));
                  }}
                />
              )}
              {modalView === 'delete-single' && (
                <DeleteContent
                  data={modalItem as DbSchemaPost}
                  onClose={onclose}
                  callback={() => {
                    if (!modalItem) throw new Error('No item selected');
                    data.mutate();
                    mutate('/api/admin/count', undefined, true);
                    const isExistOnSelected = [...selectedRows].includes(modalItem.id);
                    if (isExistOnSelected) {
                      const newSelectedRows = new Set([...selectedRows]);
                      newSelectedRows.delete(modalItem.id);
                      setSelectedRows(newSelectedRows);
                    }

                    setModalItem(undefined);
                  }}
                />
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </NanashiLayout>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<AdminPostsProps>> {
  const q = ctx.query as { [key: string]: string };

  const master_tag = await supabaseClient
    .from('master_tag')
    .select('*, post:posts(count)')
    .order('title', { ascending: true });
  const master_cat = await supabaseClient
    .from('master_cat')
    .select('*, post:posts(count)')
    .order('title', { ascending: true });

  if (master_tag.error) throw master_tag.error;
  if (master_cat.error) throw master_cat.error;

  const tags: MasterWithCount<DbSchemaMasterTag>[] = master_tag.data.map((tag) => ({
    ...tag,
    count: (tag.post[0] as any).count ?? 0,
  }));
  const categories: MasterWithCount<DbSchemaMasterCategory>[] = master_cat.data.map((cat) => ({
    ...cat,
    count: (cat.post[0] as any).count ?? 0,
  }));

  return {
    props: {
      fallbackQuery: {
        page: Number(q.page || 1),
        rowsPerPage: Number(q.rowsPerPage || c.ITEMS_PER_PAGE),
        category: q.category || null,
        order: (q.order as 'asc' | 'desc') || 'desc',
        orderBy: (q.orderBy as keyof DbRow<'posts'>) || 'created_at',
        query: q.query || null,
        status: (q.status as DbEnum<'status'>) || null,
        tags: q.tags ? q.tags.split(':') : null,
        is_featured: q.is_featured ? q.is_featured === 'true' : null,
      },
      master_tag: tags,
      master_cat: categories,
    },
  };
}
