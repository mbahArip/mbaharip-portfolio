import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalContent,
  Pagination,
  Select,
  SelectItem,
  Selection,
  SortDescriptor,
  Tooltip,
  User,
  useDisclosure,
} from '@nextui-org/react';
import axios from 'axios';
import c from 'constant';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { twMerge } from 'tailwind-merge';
import { BooleanParam, NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';

import { ErrorToast, SuccessToast } from 'components/DetailedToast';
import ErrorPage from 'components/Error';
import Icon from 'components/Icons';
import NanashiLayout from 'components/Layout/774AdminLayout';
import Loading from 'components/Loading';
import TableContent, { TableContentColumnProps, TableContentRowProps } from 'components/TableContent';
import TableActions, { TableAction } from 'components/TableContent/TableActions';

import { DeleteContent, DeleteSelectedContent, ViewSelectedContent } from 'mod/admin/comments';

import useDebounce from 'hooks/useDebouce';
import { formatDate } from 'utils/dataFormatter';
import { swrFetcher } from 'utils/swr';

import { ApiResponseSuccess } from 'types/Common';
import { DbRow, DbSchemaComment } from 'types/Supabase';

import toastConfig from 'config/toast';

const contentColumn: TableContentColumnProps<DbSchemaComment>[] = [
  {
    key: 'name',
    label: 'USER',
  },
  {
    key: 'content',
    label: 'COMMENT',
    width: 512,
  },
  {
    key: 'reply_to',
    label: 'REPLY TO',
    width: 150,
  },
  {
    key: 'created_at',
    label: 'CREATED AT',
  },
];

interface AdminCommentsProps {
  fallbackQuery?: Record<string, any>;
}
export default function AdminComments({ fallbackQuery }: AdminCommentsProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [q, setQ] = useQueryParams(
    {
      page: withDefault(NumberParam, fallbackQuery?.page ?? 1),
      rowsPerPage: withDefault(NumberParam, fallbackQuery?.rowsPerPage ?? c.ITEMS_PER_PAGE),
      order: withDefault(StringParam, fallbackQuery?.order ?? 'desc'),
      orderBy: withDefault(StringParam, fallbackQuery?.orderBy ?? 'created_at'),
      is_flagged: withDefault(BooleanParam, fallbackQuery?.is_flagged ?? false),
      is_reply: withDefault(BooleanParam, fallbackQuery?.is_reply ?? false),
      query: withDefault(StringParam, fallbackQuery?.query ?? ''),
    },
    {
      removeDefaultsFromUrl: true,
      skipUpdateWhenNoChange: true,
      updateType: 'replaceIn',
    },
  );
  const [query, setQuery] = useState<string>(q.query ?? '');
  const debouncedQuery = useDebounce(query);

  const [sort, setSort] = useState<SortDescriptor>({
    column: q.orderBy as keyof DbRow<'comments'>,
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
    setQ({
      orderBy: sort.column as string,
      order: sort.direction === 'ascending' ? 'asc' : 'desc',
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const [selectedRows, setSelectedRows] = useState<Selection>(new Set([]));

  const [modalView, setModalView] = useState<
    'view-selected' | 'flag-selected' | 'unflag-selected' | 'delete-selected' | 'delete-single' | 'view-thread'
  >('view-selected');
  const [modalItem, setModalItem] = useState<DbSchemaComment>();
  const modal = useDisclosure();

  const [errorData, setErrorData] = useState<any>();
  const data = useSWR<ApiResponseSuccess<DbSchemaComment[]>>(
    () => {
      const filteredSearchParams = Object.fromEntries(
        Object.entries(q).filter(([_, v]) => v !== undefined && v !== null),
      );
      const params = new URLSearchParams(filteredSearchParams as any);

      return `/api/admin/comments?${params.toString()}`;
    },
    swrFetcher,
    {
      onError(err, key, config) {
        setErrorData(err);
      },
    },
  );
  const selectedData = useSWR<ApiResponseSuccess<DbSchemaComment[]>>(
    `/api/admin/comments?ids=${[...selectedRows].join(':')}`,
    swrFetcher,
    {
      onError(err, key, config) {
        setErrorData(err);
      },
    },
  );

  if ((data.error || selectedData.error) && errorData) {
    console.error(errorData);
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

  const contentRow: TableContentRowProps<DbSchemaComment>[] = [
    {
      key: 'name',
      render(item) {
        return (
          <div className='flex items-center justify-between gap-8'>
            <User
              avatarProps={{ size: 'sm', src: item.avatar ?? undefined, name: item.name }}
              name={
                <div className='flex items-center gap-2'>
                  <span>{item.name}</span>
                  {item.is_flagged && (
                    <Icon
                      name='Flag'
                      className='fill-danger text-danger'
                      size='xs'
                      tooltip={'This comment is flagged, and will not be shown to other users.'}
                    />
                  )}
                </div>
              }
              description={item.user_id}
            />
            <div className='flex flex-col text-tiny text-default-500'>
              <div className='flex items-center gap-1'>
                <Icon
                  name='Flag'
                  size='xs'
                  tooltip='Reports on this comment'
                />
                <span>({item.reports || 0})</span>
              </div>
              <div className='flex items-center gap-1'>
                <Icon
                  name='Reply'
                  size='xs'
                  tooltip='Replies on this comment'
                />
                <span>({item.reply || 0})</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'content',
      render(item) {
        return <div>{item.content}</div>;
      },
    },
    {
      key: 'reply_to',
      render(item) {
        return item.parent_id || item.reply ? (
          <Button
            size='sm'
            color='primary'
            variant='light'
            className='whitespace-nowrap text-tiny'
            onPress={() => {
              setModalView('view-thread');
              setModalItem(item);
              modal.onOpen();
            }}
          >
            View replies
          </Button>
        ) : (
          <Button
            isDisabled={true}
            size='sm'
            color='default'
            variant='light'
            className='whitespace-nowrap text-tiny'
          >
            No reply
          </Button>
        );
      },
    },
    {
      key: 'created_at',
      render(item) {
        return (
          <div>
            {formatDate(item.updated_at, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        );
      },
    },
  ];
  const contentActions: (item: DbSchemaComment) => TableAction[] = (item: DbSchemaComment) => [
    {
      key: 'flag',
      label: item.is_flagged ? 'Unflag' : 'Flag',
      icon: item.is_flagged ? 'Flag' : 'FlagOff',
      description: item.is_flagged
        ? 'Unflag this comment, and show it to public.'
        : 'Flag this comment, and hide it from public.',
      color: item.is_flagged ? 'warning' : 'default',
      async onAction() {
        const toastId = `update-flag-comment-${item.id}`;
        toast.loading('Updating status...', {
          autoClose: false,
          toastId,
        });

        try {
          await axios.put(
            `/api/admin/comments/${item.id}`,
            {
              is_flagged: !item.is_flagged,
            },
            {
              headers: {
                Authorization: session?.user?.email,
              },
            },
          );

          data.mutate();
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
      label: 'Delete',
      icon: 'Trash',
      description: 'Delete this comment.',
      color: 'danger',
      async onAction() {
        setModalView('delete-single');
        setModalItem(item);
        modal.onOpen();
      },
    },
  ];

  return (
    <NanashiLayout
      seo={{
        title: 'Comments',
      }}
      header={{
        title: 'Comments',
        subtitle: 'Manage comments',
      }}
    >
      {!data ? (
        <Loading />
      ) : (
        <div className='flex w-full flex-grow flex-col gap-8'>
          <div className='flex w-full flex-col gap-4'>
            <div className='flex w-full items-center justify-between'>
              <div className='flex flex-grow items-center gap-2'>
                <Input
                  labelPlacement='outside'
                  placeholder='Search name or comment...'
                  value={query}
                  onValueChange={setQuery}
                  startContent={<Icon name='Search' />}
                  className={'max-w-sm'}
                  isClearable
                  onClear={() => {
                    setQuery('');
                    setQ({ query: undefined, order: 'desc' });
                    setSort({
                      column: 'created_at',
                      direction: 'descending',
                    });
                  }}
                />
                <Tooltip content={q.is_flagged ? 'Show all comments' : 'Show only flagged comments'}>
                  <Button
                    isIconOnly
                    variant={q.is_flagged ? 'shadow' : 'flat'}
                    className='bg-default-100'
                    onPress={() => {
                      if (q.is_flagged) setQ({ is_flagged: undefined });
                      else setQ({ is_flagged: true });
                    }}
                  >
                    <Icon
                      name='Flag'
                      className={twMerge(
                        q.is_flagged ? 'fill-danger text-danger' : 'text-default-foreground',
                        'transition !duration-150',
                      )}
                    />
                  </Button>
                </Tooltip>
                <Tooltip content={q.is_reply ? 'Show all comments' : 'Show reply only'}>
                  <Button
                    isIconOnly
                    variant={q.is_flagged ? 'shadow' : 'flat'}
                    className='bg-default-100'
                    onPress={() => {
                      if (q.is_reply) setQ({ is_reply: undefined });
                      else setQ({ is_reply: true });
                    }}
                  >
                    <Icon
                      name='Reply'
                      className={twMerge(
                        q.is_flagged ? 'fill-primary text-primary' : 'text-default-foreground',
                        'transition !duration-150',
                      )}
                    />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
          {data.data ? (
            <TableContent
              key='content'
              columns={contentColumn}
              rows={contentRow}
              items={(data.data.data as DbSchemaComment[]) || []}
              emptyContent='No comments found'
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
                      Showing {data.data.data.length} of {data.data.pagination?.totalData ?? 0} comments
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
                        {[...selectedRows].length
                          ? `${[...selectedRows].length} comments selected`
                          : 'No selected comment'}
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
                          disabledKeys={
                            selectedData.data?.data.length
                              ? selectedData.data.data.every((comment) => comment!.is_flagged === false)
                                ? ['unflag-selected']
                                : selectedData.data.data.every((comment) => comment!.is_flagged === true)
                                ? ['flag-selected']
                                : []
                              : []
                          }
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
                            aria-label='Unflag comments'
                            key={'unflag-selected'}
                            description={'Unflagged comments will be shown to public.'}
                            startContent={<Icon name='Flag' />}
                            color='success'
                            className='text-success'
                          >
                            Unflag selected
                          </DropdownItem>
                          <DropdownItem
                            aria-label='Flag comments'
                            key={'flag-selected'}
                            description={'Flagged comments will be hidden from public.'}
                            startContent={<Icon name='Flag' />}
                            color='warning'
                            className='text-warning'
                          >
                            Flag selected
                          </DropdownItem>
                          <DropdownItem
                            aria-label='Delete comments'
                            key={'delete-selected'}
                            description={'Delete the selected comments.'}
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
                  data={selectedData.data ? (selectedData.data.data as DbSchemaComment[]) : []}
                  isLoading={selectedData.isLoading || selectedData.isValidating}
                  onClose={onclose}
                />
              )}
              {modalView === 'delete-selected' && (
                <DeleteSelectedContent
                  data={selectedData.data ? (selectedData.data.data as DbSchemaComment[]) : []}
                  isLoading={selectedData.isLoading || selectedData.isValidating}
                  onClose={onclose}
                  callback={() => {
                    data.mutate();
                    setSelectedRows(new Set([]));
                  }}
                />
              )}
              {modalView === 'delete-single' && (
                <DeleteContent
                  data={modalItem as DbSchemaComment}
                  onClose={onclose}
                  callback={() => {
                    if (!modalItem) throw new Error('No item selected');
                    data.mutate();
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
              {/* {modalView === 'flag-selected' && (
                <ModalFlagSelected
                  onclose={onclose}
                  flag
                />
              )} */}
              {/* {modalView === 'unflag-selected' && (
                <ModalFlagSelected
                  onclose={onclose}
                  flag={false}
                />
              )} */}
              {/* {modalView === 'delete-selected' && <ModalDeleteSelected onclose={onclose} />} */}
              {/* {modalView === 'delete-single' && <ModalDeleteSingle onclose={onclose} />} */}
            </>
          )}
        </ModalContent>
      </Modal>
    </NanashiLayout>
  );
}

export async function getServerSideProps(
  contexts: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<AdminCommentsProps>> {
  const query = contexts.query;

  return {
    props: {
      fallbackQuery: query,
    },
  };
}
