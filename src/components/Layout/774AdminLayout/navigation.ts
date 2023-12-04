import { icons } from 'lucide-react';

import { DbColor } from 'types/Supabase';

type Navigation = {
  key: string;
  name: string;
  description?: string;
  icon: keyof typeof icons;
  href: string;
  color?: DbColor;
  external?: boolean;
  children?: Navigation[];
};

const AdminNavigationData: (Navigation | 'gap')[] = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    description: 'See the overview of the site',
    icon: 'Home',
    href: '/admin/dashboard',
  },
  {
    key: 'visit',
    name: 'Visit Site',
    description: 'Open the site in a new tab',
    icon: 'Layout',
    href: '/',
    external: true,
  },
  'gap',
  {
    key: 'posts',
    name: 'Posts',
    description: 'Overview of all posts entries',
    icon: 'PenSquare',
    href: '/admin/posts',
    children: [
      {
        key: 'posts/draft',
        name: 'Drafts',
        description: 'Posts that are not published yet',
        icon: 'CircleDashed',
        href: '/admin/posts?status=draft',
        color: 'warning',
      },
      {
        key: 'posts/published',
        name: 'Published',
        description: 'Posts that are published',
        icon: 'Circle',
        href: '/admin/posts?status=published',
        color: 'success',
      },
      {
        key: 'posts/unpublished',
        name: 'Archived',
        description: 'Posts that are archived',
        icon: 'AlertCircle',
        href: '/admin/posts?status=unpublished',
        color: 'default',
      },
    ],
  },
  {
    key: 'comments',
    name: 'Comments',
    description: 'Overview of all comments posted',
    icon: 'MessageSquare',
    href: '/admin/comments',
    children: [
      {
        key: 'comments/reported',
        name: 'Reported',
        description: 'List of reported comments',
        icon: 'Flag',
        href: '/admin/comments/reported',
        color: 'danger',
      },
      {
        key: 'comments/guestbook',
        name: 'Guestbook',
        description: 'Messages from the guestbook',
        icon: 'BookOpen',
        href: '/admin/comments/guestbook',
      },
    ],
  },
  'gap',
  {
    key: 'inbox',
    name: 'Inbox',
    description: 'Overview of all messages through the contact form',
    icon: 'Mail',
    href: '/admin/inbox',
  },
  {
    key: 'categories',
    name: 'Categories',
    description: 'Manage categories for posts',
    icon: 'Layers',
    href: '/admin/categories',
  },
  {
    key: 'tags',
    name: 'Tags',
    description: 'Manage tags for posts',
    icon: 'Tag',
    href: '/admin/tags',
  },
  {
    key: 'media',
    name: 'Media Library',
    description: 'Manage media uploaded to the site',
    icon: 'Image',
    href: '/admin/media',
  },
];

export default AdminNavigationData;
