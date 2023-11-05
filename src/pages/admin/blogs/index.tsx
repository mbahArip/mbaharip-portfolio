import {
  Button,
  ButtonGroup,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
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
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from '@nextui-org/react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchBlogsSummary, requestDeleteBlog, requestDeleteBlogs } from 'supabase/controller/Blogs.client';

import Icon from 'components/Icons';
import AdminLayout from 'components/Layout/AdminLayout';
import Link from 'components/Link';

import useDebounce from 'hooks/useDebouce';
import supabase from 'utils/client/supabase';
import { formatDate } from 'utils/dataFormatter';
import getOptimizedImage from 'utils/getOptimizedImage';
import { createPostId } from 'utils/postIdHelper';
import updateURLState from 'utils/updateUrlState';

import { State } from 'types/Common';
import { DbBlogResponseSummary, DbColor, DbMasterTagResponse, DbRow } from 'types/Supabase';

// interface BlogWithoutComments extends Omit<DbBlogResponse, 'comments'> {}

interface AdminBlogsProps {
  master_tag: DbMasterTagResponse[];
  query?: {
    page?: number;
    perPage?: number;
    q?: string;
    order?: 'asc' | 'desc';
    orderBy?: string;
    tags?: string[];
  };
}

export default function AdminBlogs(props: AdminBlogsProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [tableState, setTableState] = useState<State>('loading');
  const [query, setQuery] = useState<string>(props.query?.q ?? '');
  const debouncedQuery = useDebounce(query, 250, {
    before: () => setTableState('loading'),
    after: () => setTableState('idle'),
  });
  const [page, setPage] = useState<number>(props.query?.page ?? 1);
  const [rowsPerPage, setRowsPerPage] = useState<Selection>(new Set([String(props.query?.perPage) ?? '10']));
  const [sort, setSort] = useState<SortDescriptor>({
    column: props.query?.orderBy ?? 'created_at',
    direction: props.query?.order === 'asc' ? 'ascending' : 'descending',
  });
  const [totalData, setTotalData] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [data, setData] = useState<DbBlogResponseSummary[]>([]);

  const [selectedRows, setSelectedRows] = useState<Selection>(new Set([]));
  const [selectedRowsState, setSelectedRowsState] = useState<State>('idle');
  const [selectedRowsData, setSelectedRowsData] = useState<DbBlogResponseSummary[]>([]);

  const [tags, setTags] = useState<DbMasterTagResponse[]>(props.master_tag);
  const [tagsSearch, setTagsSearch] = useState<string>('');
  const debouncedTagsSearch = useDebounce(tagsSearch, 250);
  const [selectedTags, setSelectedTags] = useState<Selection>(new Set([...(props.query?.tags ?? [])]));

  const modal = useDisclosure();
  type ModalView = 'selected-list' | 'selected-delete' | 'single-share' | 'single-delete';
  const [modalView, setModalView] = useState<ModalView>('selected-list');

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    setPage(props.query?.page ?? 1);
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, sort, rowsPerPage, selectedTags]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (page && page > 1) url.searchParams.set('page', String(page));
    else url.searchParams.delete('page');
    if (rowsPerPage && [...rowsPerPage][0] !== '10') url.searchParams.set('perPage', [...rowsPerPage][0] as string);
    else url.searchParams.delete('perPage');
    if (debouncedQuery) url.searchParams.set('q', debouncedQuery);
    else url.searchParams.delete('q');
    if (sort.direction && sort.direction !== 'descending') url.searchParams.set('order', sort.direction);
    else url.searchParams.delete('order');
    if (sort.column && sort.column !== 'created_at') url.searchParams.set('orderBy', sort.column as string);
    else url.searchParams.delete('orderBy');
    if (selectedTags && [...selectedTags].length > 0) url.searchParams.set('tags', [...selectedTags].join(':'));
    else url.searchParams.delete('tags');

    updateURLState(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, page, rowsPerPage, sort, selectedTags]);

  useEffect(() => {
    if (!debouncedTagsSearch) return setTags(props.master_tag);

    const filteredTags = props.master_tag.filter((tag) =>
      tag.name.toLowerCase().includes(debouncedTagsSearch.toLowerCase()),
    );
    setTags(filteredTags);
  }, [debouncedTagsSearch, props.master_tag]);

  const fetchData = useCallback(async () => {
    setTableState('loading');

    try {
      const fetch = await fetchBlogsSummary({
        page,
        rowsPerPage: [...rowsPerPage][0] as number,
        query: debouncedQuery,
        tags: [...selectedTags] as string[],
        order: sort.direction === 'ascending' ? 'asc' : 'desc',
        orderBy: sort.column as keyof DbRow<'blogs'>,
      });

      setData(fetch.data ?? []);
      setTotalData(fetch.totalData);
      setTotalPage(fetch.totalPage);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load blogs');
    } finally {
      setTableState('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, page, rowsPerPage, sort, selectedTags]);

  const fetchSelectedRowsData = useCallback(async () => {
    if (![...selectedRows].length) {
      setSelectedRowsData([]);
      return;
    }

    setSelectedRowsState('loading');

    try {
      const fetch = await fetchBlogsSummary({
        ids: [...selectedRows] as string[],
      });

      setSelectedRowsData(fetch.data ?? []);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load selected blogs');
    } finally {
      setSelectedRowsState('idle');
    }
  }, [selectedRows]);

  const openModal = (view: ModalView) => {
    setModalView(view);
    if (view === 'selected-list') fetchSelectedRowsData();
    modal.onOpenChange();
  };

  type ModalProps = {
    onClose: () => void;
  };
  function RenderSelectedList({ onClose }: ModalProps) {
    return (
      <>
        <ModalHeader>Selected Blogs</ModalHeader>
        <ModalBody>
          <Table
            aria-label='selected-list'
            removeWrapper
          >
            <TableHeader>
              <TableColumn>THUMBNAIL</TableColumn>
              <TableColumn>TITLE</TableColumn>
              <TableColumn>SUMMARY</TableColumn>
              <TableColumn>TAGS</TableColumn>
              <TableColumn>CREATED AT</TableColumn>
            </TableHeader>
            <TableBody
              items={selectedRowsData}
              isLoading={selectedRowsState === 'loading'}
              loadingContent={<Spinner size='lg' />}
            >
              {(item) => (
                <TableRow>
                  <TableCell>
                    <Image
                      src={getOptimizedImage(item.thumbnail_url, { width: 256, height: 128 })}
                      alt={item.title}
                      removeWrapper
                      radius='sm'
                      className='w-24 object-cover'
                    />
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.summary}</TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {item.tags?.map((tag) => (
                        <Chip
                          size='sm'
                          variant='dot'
                          color={tag.color as DbColor}
                          key={tag.id}
                        >
                          {tag.name}
                        </Chip>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(item.created_at!)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button
            color='secondary'
            onPress={onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </>
    );
  }
  function RenderSelectedDelete({ onClose }: ModalProps) {
    const [deleteState, setDeleteState] = useState<State>('idle');
    const handleDelete = async () => {
      setDeleteState('loading');
      try {
        if (!session) throw new Error('Session not found, please refresh or re-login');
        await requestDeleteBlogs([...selectedRows] as string[], session);

        toast.success('Successfully deleted blogs');
        fetchData();
        setSelectedRows(new Set([]));
        setSelectedRowsData([]);
        onClose();
      } catch (error: any) {
        console.error(error);
        toast.error('Failed to delete blogs, details in console.');
      } finally {
        setDeleteState('idle');
      }
    };
    return (
      <>
        <ModalHeader>Delete selected blogs</ModalHeader>
        <ModalBody>
          <span>{`Are you sure you want to delete ${[...selectedRows].length} blogs?`}</span>
          <span className='text-small text-danger'>This action cannot be undone.</span>
        </ModalBody>
        <ModalFooter>
          <Button
            color='secondary'
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            color='danger'
            onPress={handleDelete}
            isLoading={deleteState === 'loading'}
          >
            Delete
          </Button>
        </ModalFooter>
      </>
    );
  }
  function RenderSingleDelete({ onClose }: ModalProps) {
    const [deleteState, setDeleteState] = useState<State>('idle');
    const handleDelete = async () => {
      setDeleteState('loading');
      try {
        if (!session) throw new Error('Session not found, please refresh or re-login');
        if (!selectedRowsData.length) throw new Error('No post selected');

        await requestDeleteBlog(selectedRowsData[0].id, session);

        toast.success('Successfully deleted blogs');
        fetchData();
        setSelectedRows(new Set([]));
        setSelectedRowsData([]);
        onClose();
      } catch (error: any) {
        console.error(error);
        toast.error('Failed to delete blogs, details in console.');
      } finally {
        setDeleteState('idle');
      }
    };
    return (
      <>
        <ModalHeader>Delete selected blogs</ModalHeader>
        <ModalBody>
          <span>{`Are you sure you want to delete ${selectedRowsData[0].title ?? 'Fetching data...'}?`}</span>
          <span className='text-small text-danger'>This action cannot be undone.</span>
        </ModalBody>
        <ModalFooter>
          <Button
            color='secondary'
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            color='danger'
            onPress={handleDelete}
            isLoading={deleteState === 'loading'}
          >
            Delete
          </Button>
        </ModalFooter>
      </>
    );
  }

  return (
    <AdminLayout
      seo={{ title: 'Blog' }}
      icon='FileText'
    >
      <Table
        topContent={
          <div className='flex flex-col gap-2'>
            <div className='flex items-end justify-between gap-3'>
              <div className='flex flex-grow items-end gap-3'>
                <Input
                  isClearable
                  labelPlacement='outside'
                  className='w-full max-w-[44%]'
                  placeholder='Search by title...'
                  startContent={
                    <Icon
                      name='Search'
                      size='sm'
                    />
                  }
                  value={query}
                  onValueChange={setQuery}
                  onClear={() => setQuery('')}
                />
                <Popover
                  placement='bottom'
                  aria-label='Tags filter'
                  classNames={{
                    base: 'px-3',
                  }}
                >
                  <PopoverTrigger>
                    <Button
                      variant='flat'
                      endContent={
                        <Icon
                          name='ChevronDown'
                          size='sm'
                        />
                      }
                    >
                      Tags
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='gap-2'>
                    <Input
                      labelPlacement='outside'
                      placeholder='Search tags...'
                      startContent={<Icon name='Search' />}
                      value={tagsSearch}
                      onValueChange={setTagsSearch}
                      isClearable
                      onClear={() => setTagsSearch('')}
                    />
                    <Divider />
                    <ScrollShadow
                      className='max-h-[32rem] w-full'
                      size={20}
                    >
                      <Listbox
                        aria-label='Tags filter'
                        selectedKeys={selectedTags}
                        onSelectionChange={setSelectedTags}
                        selectionMode='multiple'
                        className='w-full px-0'
                      >
                        {tags.map((tag) => (
                          <ListboxItem
                            key={tag.id}
                            textValue={tag.id}
                          >
                            <Chip
                              variant='dot'
                              color={tag.color as DbColor}
                              classNames={{
                                base: 'border-0',
                              }}
                            >
                              {tag.name}
                            </Chip>
                          </ListboxItem>
                        ))}
                      </Listbox>
                    </ScrollShadow>
                  </PopoverContent>
                </Popover>
              </div>
              <div className='flex gap-3'>
                <Button
                  as={Link}
                  href='/admin/blogs/new'
                  color='secondary'
                  endContent={<Icon name='Plus' />}
                >
                  New Blog
                </Button>
              </div>
            </div>
            <div className='flex items-center justify-between gap-3 text-sm text-default-500'>
              <span>
                Showing {data.length} of {totalData} blogs
              </span>

              <div className='flex w-fit min-w-[12rem] items-center gap-1'>
                <span className='whitespace-nowrap'>Rows per page:</span>
                <Select
                  labelPlacement='outside'
                  aria-label='Rows per page'
                  size='sm'
                  variant='bordered'
                  selectedKeys={rowsPerPage}
                  selectionMode='single'
                  onSelectionChange={setRowsPerPage}
                  classNames={{
                    innerWrapper: 'py-0',
                    trigger: 'py-0 h-fit',
                    value: 'text-foreground',
                  }}
                >
                  <SelectItem key='1'>1</SelectItem>
                  <SelectItem key='10'>10</SelectItem>
                  <SelectItem key='25'>25</SelectItem>
                  <SelectItem key='50'>50</SelectItem>
                  <SelectItem key='100'>100</SelectItem>
                </Select>
              </div>
            </div>
          </div>
        }
        topContentPlacement='inside'
        bottomContent={
          <div className='relative flex items-end justify-between gap-3'>
            <ButtonGroup
              size='sm'
              variant='flat'
              isDisabled={![...selectedRows].length}
            >
              <Tooltip content='View selected'>
                <Button
                  onPress={() => openModal('selected-list')}
                  startContent={
                    <Icon
                      name={[...selectedRows].length ? 'Eye' : 'EyeOff'}
                      size='sm'
                    />
                  }
                >
                  {[...selectedRows].length ? `${[...selectedRows].length} item(s) selected` : `No item selected`}
                </Button>
              </Tooltip>
              <Dropdown aria-label='Selected actions'>
                <DropdownTrigger>
                  <Button isIconOnly>
                    <Icon
                      name='ChevronDown'
                      size='sm'
                    />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label='Selected actions menu'
                  onAction={(key) => {
                    const anchor = document.createElement('a');
                    switch (key) {
                      case 'action-export-json':
                        anchor.href = `/api/blogs/export?type=json&ids=${[...selectedRows].join(',')}`;
                        anchor.download = `db-export-blogs-${new Date().toISOString()}.json`;
                        anchor.click();
                        anchor.remove();
                        break;
                      case 'action-export-csv':
                        anchor.href = `/api/blogs/export?type=csv&ids=${[...selectedRows].join(',')}`;
                        anchor.download = `db-export-blogs-${new Date().toISOString()}.csv`;
                        anchor.click();
                        anchor.remove();
                        break;
                      case 'action-delete':
                        openModal('selected-delete');
                        break;
                    }
                  }}
                >
                  <DropdownItem
                    aria-label='Export to JSON'
                    key={'action-export-json'}
                    startContent={
                      <Icon
                        name='FileJson'
                        size='sm'
                      />
                    }
                  >
                    Export to JSON
                  </DropdownItem>
                  <DropdownItem
                    aria-label='Export to CSV'
                    key={'action-export-csv'}
                    startContent={
                      <Icon
                        name='FileSpreadsheet'
                        size='sm'
                      />
                    }
                  >
                    Export to CSV
                  </DropdownItem>
                  <DropdownItem
                    aria-label='Delete selected'
                    key={'action-delete'}
                    color='danger'
                    className='text-danger'
                    startContent={
                      <Icon
                        name='Trash'
                        size='sm'
                      />
                    }
                  >
                    Delete selected
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </ButtonGroup>
            {totalPage > 1 && (
              <Pagination
                size='sm'
                color='default'
                total={totalPage}
                initialPage={page}
                onChange={setPage}
              />
            )}
          </div>
        }
        color='default'
        selectionMode='multiple'
        aria-label='Blogs table'
        selectedKeys={selectedRows}
        onSelectionChange={setSelectedRows}
        sortDescriptor={sort}
        onSortChange={setSort}
      >
        <TableHeader>
          <TableColumn>THUMBNAIL</TableColumn>
          <TableColumn
            key={'title'}
            allowsSorting
          >
            TITLE
          </TableColumn>
          <TableColumn
            key={'summary'}
            allowsSorting
          >
            SUMMARY
          </TableColumn>
          <TableColumn>TAGS</TableColumn>
          <TableColumn
            key={'created_at'}
            allowsSorting
          >
            CREATED AT / UPDATED AT
          </TableColumn>
          <TableColumn
            hideHeader
            align='end'
          >
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody
          items={data}
          isLoading={tableState === 'loading'}
          loadingContent={<Spinner size='lg' />}
          emptyContent={'No data found.'}
        >
          {(item) => (
            <TableRow>
              <TableCell>
                <Image
                  src={getOptimizedImage(item.thumbnail_url, { width: 256, height: 128 })}
                  alt={item.title}
                  removeWrapper
                  radius='sm'
                  className='w-24 object-cover'
                />
              </TableCell>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.summary}</TableCell>
              <TableCell>
                <div className='flex flex-wrap gap-1'>
                  {item.tags?.map((tag) => (
                    <Chip
                      size='sm'
                      variant='dot'
                      color={tag.color as DbColor}
                      key={tag.id}
                    >
                      {tag.name}
                    </Chip>
                  ))}
                </div>
              </TableCell>
              <TableCell className='text-default-500'>
                <Tooltip
                  content={
                    <div className='flex flex-col gap-1'>
                      <span className='text-tiny'>
                        <b>Created at:</b>{' '}
                        {formatDate(item.created_at!, {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                      <span className='text-tiny'>
                        <b>Updated at:</b>{' '}
                        {item.created_at === item.updated_at
                          ? '-'
                          : formatDate(item.updated_at!, {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                      </span>
                    </div>
                  }
                >
                  <span>
                    {item.created_at === item.updated_at
                      ? formatDate(item.created_at!, {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : formatDate(item.updated_at!, {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                  </span>
                </Tooltip>
              </TableCell>
              <TableCell>
                <div className='relative flex items-center justify-end gap-2'>
                  <Dropdown
                    aria-label='Action'
                    placement='bottom-end'
                  >
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        variant='light'
                      >
                        <Icon name='MoreVertical' />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label='Action Menu'
                      onAction={(e) => {
                        switch (e) {
                          case 'action-edit':
                            router.push(`/admin/blogs/${item.id}/edit`);
                            break;
                          case 'action-view':
                            window.open(`/blogs/${createPostId(item.id, item.title)}`, '_blank');
                            break;
                          case 'action-delete':
                            setSelectedRowsData([item]);
                            openModal('single-delete');
                            break;
                        }
                      }}
                    >
                      <DropdownItem
                        aria-label='Edit blog'
                        key={'action-edit'}
                        startContent={<Icon name='Pencil' />}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        aria-label='View blog'
                        key={'action-view'}
                        startContent={<Icon name='Eye' />}
                        endContent={<Icon name='ExternalLink' />}
                      >
                        View
                      </DropdownItem>
                      <DropdownItem
                        aria-label='Delete blog'
                        color='danger'
                        key={'action-delete'}
                        startContent={<Icon name='Trash' />}
                        className='text-danger'
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        size='lg'
        isOpen={modal.isOpen}
        onOpenChange={modal.onOpenChange}
        classNames={{
          base: 'w-full max-w-screen-md',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              {modalView === 'selected-list' && <RenderSelectedList onClose={onClose} />}
              {modalView === 'selected-delete' && <RenderSelectedDelete onClose={onClose} />}
              {modalView === 'single-delete' && <RenderSingleDelete onClose={onClose} />}
            </>
          )}
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<AdminBlogsProps>> {
  const { page, perPage, q, order, orderBy, tags } = context.query;
  const _page = Number(page) || 1;
  const _perPage = perPage === '10' || perPage === '25' || perPage === '50' || perPage === '100' ? Number(perPage) : 10;
  const _q = q ? String(q) : '';
  const _order = order ? String(order) : 'desc';
  const _orderBy = orderBy ? String(orderBy) : 'created_at';
  const _tags = tags ? String(tags).split(':') : [];

  const master_tag = await supabase.from('master_tag').select('*').order('name', { ascending: true });

  if (master_tag.error) throw new Error(master_tag.error.message);

  return {
    props: {
      master_tag: master_tag.data ?? [],
      query: {
        page: _page,
        perPage: _perPage,
        q: _q,
        order: _order as 'asc' | 'desc',
        orderBy: _orderBy,
        tags: _tags,
      },
    },
  };
}
