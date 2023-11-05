import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';

import Icon from 'components/Icons';
import AdminLayout from 'components/Layout/AdminLayout';
import Link from 'components/Link';

import supabase from 'utils/client/supabase';
import { formatRelativeDate } from 'utils/dataFormatter';
import { createPostId } from 'utils/postIdHelper';

import { DbCommentResponse, DbContactFormResponse, DbReportResponse } from 'types/Supabase';

type LatestComments = DbCommentResponse & {
  reply_to?: string | null;
  blog?: {
    id: string;
    title: string;
  } | null;
  project?: {
    id: string;
    title: string;
  } | null;
  stuff?: {
    id: string;
    title: string;
  } | null;
};
export default function AdminDashboard() {
  const [loaded, setLoaded] = useState<{
    totalBlogs: boolean;
    totalProjects: boolean;
    totalStuff: boolean;
    latestComments: boolean;
    reportedComments: boolean;
    unreadMessages: boolean;
  }>({
    totalBlogs: false,
    totalProjects: false,
    totalStuff: false,
    latestComments: false,
    reportedComments: false,
    unreadMessages: false,
  });
  const [total, setTotal] = useState<Record<'blogs' | 'projects' | '3d', number>>({
    'blogs': 0,
    'projects': 0,
    '3d': 0,
  });
  const [latestComments, setLatestComments] = useState<LatestComments[]>([]);
  const [reportedComments, setReportedComments] = useState<DbReportResponse[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<DbContactFormResponse[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([fetchTotal(), fetchComments(), fetchReported(), fetchMessages()]);
    };

    fetchInitialData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTotal = async () => {
    const _blogs = supabase.from('blogs').select(undefined, { count: 'exact' });
    const _projects = supabase.from('projects').select(undefined, { count: 'exact' });
    const _stuff = supabase.from('stuff').select(undefined, { count: 'exact' });

    const [blogs, projects, stuff] = await Promise.all([_blogs, _projects, _stuff]);
    if (blogs.error) throw new Error(blogs.error.message);
    if (projects.error) throw new Error(projects.error.message);
    if (stuff.error) throw new Error(stuff.error.message);

    const newVal: typeof total = {
      'blogs': blogs.count ?? 0,
      'projects': projects.count ?? 0,
      '3d': stuff.count ?? 0,
    };

    setLoaded((prev) => ({
      ...prev,
      totalBlogs: true,
      totalProjects: true,
      totalStuff: true,
    }));
    setTotal(newVal);
  };
  const fetchComments = async () => {
    const data = await supabase
      .from('comments')
      .select('*,blogs(id,title),projects(id,title),stuff(id,title)')
      .eq('is_me', false)
      .order('created_at', { ascending: false })
      .limit(5);
    if (data.error) throw new Error(data.error.message);

    const dataResponse: LatestComments[] = data.data.map(
      (comment) =>
        ({
          id: comment.id,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          user_id: comment.user_id,
          user_name: comment.user_name,
          user_avatar: comment.user_avatar,
          content: comment.content,
          parent_id: comment.parent_id,
          is_published: comment.is_published,
          is_me: comment.is_me,
          reply_to: comment.reply_to,
          blog: comment.blogs.length > 0 ? { id: comment.blogs[0].id, title: comment.blogs[0].title } : null,
          project:
            comment.projects.length > 0 ? { id: comment.projects[0].id, title: comment.projects[0].title } : null,
          stuff: comment.stuff.length > 0 ? { id: comment.stuff[0].id, title: comment.stuff[0].title } : null,
        } as LatestComments),
    );

    setLoaded((prev) => ({
      ...prev,
      latestComments: true,
    }));
    setLatestComments(dataResponse);
  };
  const fetchReported = async () => {
    const data = await supabase
      .from('reported_comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data.error) throw new Error(data.error.message);

    setLoaded((prev) => ({
      ...prev,
      reportedComments: true,
    }));
    setReportedComments(data.data);
  };
  const fetchMessages = async () => {
    const data = await supabase.from('contact_form').select('*').order('created_at', { ascending: false }).limit(5);
    if (data.error) throw new Error(data.error.message);

    setLoaded((prev) => ({
      ...prev,
      unreadMessages: true,
    }));
    setUnreadMessages(data.data);
  };

  return (
    <AdminLayout
      seo={{
        title: 'Dashboard',
      }}
      icon='LayoutDashboard'
    >
      <div className='grid grid-cols-3 gap-4'>
        <Card
          classNames={{
            header: 'pb-0 items-center gap-1 font-semibold',
            body: 'pt-2 text-end text-4xl font-bold',
          }}
        >
          <CardHeader>
            <span>Total Blog Posts</span>
          </CardHeader>
          <CardBody>
            <Skeleton isLoaded={loaded.totalBlogs}>{total['blogs']}</Skeleton>
          </CardBody>
        </Card>
        <Card
          classNames={{
            header: 'pb-0 items-center gap-1 font-semibold',
            body: 'pt-2 text-end text-4xl font-bold',
          }}
        >
          <CardHeader>
            <span>Total Projects</span>
          </CardHeader>
          <CardBody>
            <Skeleton isLoaded={loaded.totalProjects}>{total['projects']}</Skeleton>
          </CardBody>
        </Card>
        <Card
          classNames={{
            header: 'pb-0 items-center gap-1 font-semibold',
            body: 'pt-2 text-end text-4xl font-bold',
          }}
        >
          <CardHeader>
            <span>Total 3D / Other Stuff</span>
          </CardHeader>
          <CardBody>
            <Skeleton isLoaded={loaded.totalStuff}>{total['3d']}</Skeleton>
          </CardBody>
        </Card>

        <Card
          classNames={{
            base: 'col-span-2',
            header: 'pb-0 items-center gap-1 font-semibold',
            body: 'pt-2',
          }}
        >
          <CardHeader>
            <span>Latest comments</span>
          </CardHeader>
          <CardBody>
            <Skeleton isLoaded={loaded.latestComments}>
              <Table
                aria-label='Latest comments'
                removeWrapper
              >
                <TableHeader>
                  <TableColumn>User</TableColumn>
                  <TableColumn>Category</TableColumn>
                  <TableColumn>Post</TableColumn>
                  <TableColumn>Content</TableColumn>
                  <TableColumn>Created At</TableColumn>
                </TableHeader>
                <TableBody
                  items={latestComments}
                  emptyContent={'There are no comments yet.'}
                >
                  {(item) => (
                    <TableRow>
                      <TableCell className='font-bold'>{item.user_name}</TableCell>
                      <TableCell>
                        <Chip
                          size='sm'
                          variant='dot'
                          color={item.blog ? 'success' : item.project ? 'warning' : item.stuff ? 'danger' : 'default'}
                        >
                          {item.blog ? 'Blog' : item.project ? 'Project' : item.stuff ? '3D / Other Stuff' : 'Unknown'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Link
                          isExternal
                          showAnchorIcon
                          size='sm'
                          href={`/${item.blog ? 'blogs' : item.project ? 'projects' : '3d'}/${createPostId(
                            item.blog?.id ?? item.project?.id ?? item.stuff?.id ?? '',
                            item.blog?.title ?? item.project?.title ?? item.stuff?.title ?? '',
                          )}`}
                          className='line-clamp-1'
                        >
                          {item.blog?.title ?? item.project?.title ?? item.stuff?.title}
                        </Link>
                      </TableCell>
                      <TableCell className='max-w-xs'>
                        <p className='line-clamp-2'>{item.content}</p>
                      </TableCell>
                      <TableCell>{formatRelativeDate(item.created_at)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Skeleton>
          </CardBody>
        </Card>
        <Card
          classNames={{
            header: 'pb-0 items-center gap-1 font-semibold',
            body: 'pt-2',
          }}
        >
          <CardHeader>
            <span>Reported comments</span>
          </CardHeader>
          <CardBody>
            <Skeleton isLoaded={loaded.reportedComments}>
              <Table
                aria-label='Reported comments'
                removeWrapper
              >
                <TableHeader>
                  <TableColumn>Reason</TableColumn>
                  <TableColumn>Created At</TableColumn>
                  <TableColumn hideHeader>Action</TableColumn>
                </TableHeader>
                <TableBody
                  items={reportedComments}
                  emptyContent={'There are no reported comment.'}
                >
                  {(item) => (
                    <TableRow>
                      <TableCell>
                        <p className='line-clamp-2'>{item.reason}</p>
                      </TableCell>
                      <TableCell>{formatRelativeDate(item.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          as={Link}
                          href={`/admin/moderation/${item.comment_id}`}
                          variant='shadow'
                          size='sm'
                          endContent={
                            <Icon
                              name='ArrowRightCircle'
                              size='sm'
                            />
                          }
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Skeleton>
          </CardBody>
        </Card>

        <Card
          classNames={{
            base: 'col-span-full',
            header: 'pb-0 items-center gap-1 font-semibold',
            body: 'pt-2',
          }}
        >
          <CardHeader>
            <span>Unread messages</span>
          </CardHeader>
          <CardBody>
            <Skeleton isLoaded={loaded.unreadMessages}>
              <Table
                aria-label='Unread messages'
                removeWrapper
              >
                <TableHeader>
                  <TableColumn>Type</TableColumn>
                  <TableColumn>Name</TableColumn>
                  <TableColumn>Email</TableColumn>
                  <TableColumn>Message</TableColumn>
                  <TableColumn>Created At</TableColumn>
                  <TableColumn hideHeader>Action</TableColumn>
                </TableHeader>
                <TableBody
                  items={unreadMessages}
                  emptyContent={'There are no message.'}
                >
                  {(item) => (
                    <TableRow>
                      <TableCell>
                        <Chip
                          size='sm'
                          variant='dot'
                          color={
                            item.type === 'question'
                              ? 'primary'
                              : item.type === 'project'
                              ? 'secondary'
                              : item.type === 'commission'
                              ? 'success'
                              : item.type === 'other'
                              ? 'warning'
                              : 'default'
                          }
                          classNames={{
                            content: 'capitalize',
                          }}
                        >
                          {item.type}
                        </Chip>
                      </TableCell>
                      <TableCell className='font-bold'>{item.name}</TableCell>
                      <TableCell className='text-default-500'>{item.email}</TableCell>
                      <TableCell>
                        <p className='line-clamp-2'>{item.message}</p>
                      </TableCell>
                      <TableCell>{formatRelativeDate(item.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          as={Link}
                          href={`/admin/messages/${item.id}`}
                          variant='shadow'
                          size='sm'
                          endContent={
                            <Icon
                              name='ArrowRightCircle'
                              size='sm'
                            />
                          }
                        >
                          Reply
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Skeleton>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
}
