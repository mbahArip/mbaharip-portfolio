import {
  Avatar,
  Image,
  Listbox,
  ListboxItem,
  ListboxSection,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react';
import c from 'constant';
import { motion } from 'framer-motion';
import { icons } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';
import Link from 'components/Link';

import { useSettings } from 'contexts/settings';

import { State } from 'types/Common';

const navigation: { name: string; href: string }[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    name: 'Blogs',
    href: '/admin/blogs',
  },
  {
    name: 'Projects',
    href: '/admin/projects',
  },
  {
    name: '3D and Stuff',
    href: '/admin/3d',
  },
  {
    name: 'Messages',
    href: '/admin/messages',
  },
  {
    name: 'Moderation',
    href: '/admin/moderation',
  },
];

interface AdminLayoutProps {
  seo?: Omit<NextSeoProps, 'nofollow' | 'noindex' | 'robotsProps'>;
  defaultState?: State;
  className?: string;
  children: React.ReactNode;
  icon: keyof typeof icons;
  showTitle?: boolean;
  removeGap?: boolean;
}
export default function AdminLayout(props: AdminLayoutProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const settings = useSettings();

  const [pageState, setPageState] = useState<State>(props.defaultState ?? 'loading');
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  useEffect(() => {
    if (props.defaultState === 'idle') return;
    /**
     * To be honest, I don't know what causing hydration error
     * But it seems fixed by delaying the content render
     */
    const timeout = setTimeout(() => {
      setPageState('idle');
    }, 50);

    return () => {
      clearTimeout(timeout);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setPageState('loading');
    };
    const handleRouteChangeComplete = () => {
      setPageState('idle');
    };
    const handleRouteChangeError = () => {
      setPageState('idle'); // Set page state to 'idle' on route change error
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router.events]);

  return (
    <>
      <NextSeo
        {...props.seo}
        noindex
        nofollow
        robotsProps={{
          noarchive: true,
          noimageindex: true,
          nosnippet: true,
          notranslate: true,
        }}
      />
      <div className='grid h-screen w-screen place-items-center md:hidden'>
        <span className='text-large text-default-500'>Mobile view is not supported.</span>
      </div>
      <div
        className={twMerge(
          'hidden h-full min-h-fit w-full flex-grow flex-col gap-8 md:flex',
          props.removeGap && 'gap-0',
        )}
      >
        <nav className='sticky top-0 z-50 col-span-3 flex h-fit w-full flex-col items-center justify-center gap-4 border-b border-divider bg-content1 py-2 shadow-medium'>
          <div className='flex items-center gap-2'>
            <Image
              src='/logo.svg'
              alt='mbaharip logo'
              className='h-8'
            />
            <div className='flex items-center gap-1'>
              <span className='text-2xl font-bold'>mbaharip</span>
              <span className='text-2xl font-light'>Admin</span>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {navigation.map((item, index) => (
              <Fragment key={item.name}>
                <Link
                  href={item.href}
                  key={item.name}
                  color={router.pathname.startsWith(item.href) ? 'primary' : 'foreground'}
                  className={twMerge(router.pathname.startsWith(item.href) && 'font-bold')}
                >
                  {item.name}
                </Link>
                {index !== navigation.length - 1 && <div className='h-6 w-px bg-divider' />}
              </Fragment>
            ))}
          </div>
          <Popover
            showArrow
            offset={18}
            isOpen={popoverOpen}
            onOpenChange={setPopoverOpen}
          >
            <PopoverTrigger>
              <Avatar
                classNames={{
                  base: 'absolute right-4 cursor-pointer',
                }}
                isBordered
                color={settings.isHireable ? 'success' : 'danger'}
                src={session?.user?.image ?? c.GITHUB_AVATAR}
              />
            </PopoverTrigger>
            <PopoverContent className='w-full min-w-[16rem] items-start gap-2 px-3 py-2'>
              <span className='text-start text-tiny'>
                Welcome back, <b>{session?.user?.name}</b>!
              </span>
              <Listbox
                aria-label='User settings'
                variant='shadow'
                onAction={(key) => {
                  setPopoverOpen(false);
                  switch (key) {
                    case 'settings':
                      toast.info('Coming soon!');
                      break;
                    case 'hireable':
                      if (settings.onHireableChange) settings.onHireableChange(!settings.isHireable);
                      break;
                    case 'main-site':
                      const url = new URL(window.location.href);
                      window.open(url.origin);
                      break;
                    case 'logout':
                      signOut({
                        callbackUrl: '/admin',
                      });
                      break;
                    default:
                      toast.error('Unknown action');
                      break;
                  }
                }}
              >
                <ListboxSection showDivider>
                  <ListboxItem
                    key={'settings'}
                    textValue='settings'
                  >
                    User settings
                  </ListboxItem>
                  <ListboxItem
                    key={'hireable'}
                    textValue='hireable'
                    color={settings.isHireable ? 'success' : 'danger'}
                    classNames={{
                      base: twMerge('text-danger', settings.isHireable && 'text-success'),
                    }}
                    description={settings.isHireable ? 'Set as busy' : 'Set as available'}
                  >
                    {settings.isHireable ? <>I&apos;m currently available</> : <>I&apos;m currently busy</>}
                  </ListboxItem>
                </ListboxSection>
                <ListboxSection>
                  <ListboxItem
                    key={'main-site'}
                    textValue='main-site'
                    endContent={<Icon name='ExternalLink' />}
                  >
                    Open main site
                  </ListboxItem>
                  <ListboxItem
                    color='danger'
                    key={'logout'}
                    textValue='logout'
                    classNames={{
                      base: 'text-danger',
                    }}
                  >
                    Logout
                  </ListboxItem>
                </ListboxSection>
              </Listbox>
            </PopoverContent>
          </Popover>
        </nav>

        {pageState === 'loading' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.25,
              ease: 'easeInOut',
              type: 'tween',
            }}
            key={'loading'}
            className='col-span-9 grid h-full w-full flex-grow place-items-center'
          >
            <video
              className='h-32 w-32'
              autoPlay
              loop
              muted
            >
              <source
                src='/loading.webm'
                type='video/webm'
              />
            </video>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut', type: 'tween' }}
            id='site-content'
            className={twMerge(
              'col-span-9 flex h-fit w-full flex-col gap-4 overflow-y-hidden px-4',
              props.className && props.className,
            )}
          >
            {props.showTitle && (
              <div className='flex items-center gap-2'>
                <Icon
                  name={props.icon}
                  size='xl'
                />
                <h2>{props?.seo?.title ?? ''}</h2>
              </div>
            )}
            {props.children}
          </motion.div>
        )}
      </div>
    </>
  );
}

AdminLayout.defaultProps = {
  showTitle: true,
};
