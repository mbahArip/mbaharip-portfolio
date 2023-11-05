import { Button, Card, CardBody, CardFooter, CardHeader, Image, Input } from '@nextui-org/react';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth/next';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Icon from 'components/Icons';
import DefaultLayout from 'components/Layout/DefaultLayout';

import supabase from 'utils/client/supabase';

import { State } from 'types/Common';

import { authOptions } from '../api/auth/[...nextauth]';

interface AdminLoginPageProps {
  loggedIn: boolean;
}
export default function AdminLogin({ loggedIn }: AdminLoginPageProps) {
  const router = useRouter();
  const [loginState, setLoginState] = useState<State>('disabled');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    if (loggedIn)
      toast.error('Who are you? What are you doing here? Go away!', {
        toastId: 'admin-hush',
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (email && password) {
      setLoginState('idle');
    } else {
      setLoginState('disabled');
    }
  }, [email, password]);

  const loginHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoginState('loading');
    try {
      const login = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (login?.error) throw new Error(login.error);
      toast.success('Welcome back!');
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error('Who are you? What are you doing here? Go away!');
    } finally {
      setLoginState('idle');
    }
  };

  return (
    <>
      <DefaultLayout
        seo={{
          title: 'Login',
          robotsProps: {
            noarchive: true,
            noimageindex: true,
            nosnippet: true,
            notranslate: true,
          },
          nofollow: true,
          noindex: true,
        }}
        className='grid place-items-center'
      >
        <Card
          classNames={{
            base: 'max-w-screen-sm w-full relative z-10',
            header: 'flex items-center gap-1',
            body: 'gap-2',
          }}
        >
          <CardHeader>
            <Icon
              name='User'
              size='lg'
            />
            <h4 className='font-bold'>Login</h4>
          </CardHeader>
          <form onSubmit={loginHandler}>
            <CardBody>
              <Input
                placeholder='johndoe@acme.com'
                label='Email'
                labelPlacement='outside'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder='********'
                label='Password'
                labelPlacement='outside'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </CardBody>
            <CardFooter>
              <Button
                type='submit'
                variant='shadow'
                color='primary'
                fullWidth
                isDisabled={loginState === 'disabled'}
                isLoading={loginState === 'loading'}
              >
                Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </DefaultLayout>
      <div className='absolute bottom-2 left-1/2 z-10 -translate-x-1/2'>
        <Image
          src='/logo.svg'
          alt='mbaharip logo'
          className='h-8 w-8'
          removeWrapper
        />
      </div>
      <div className='absolute left-0 top-0 z-0 h-screen w-screen overflow-hidden bg-login'></div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session) {
    if (session.user?.name === 'mbaharip' && session.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      await supabase.auth.signInWithPassword({
        email: process.env.NEXT_PUBLIC_ADMIN_EMAIL as string,
        password: process.env.ADMIN_PASSWORD as string,
      });
      return {
        redirect: {
          destination: '/admin/dashboard',
          permanent: false,
        },
      };
    }
  }
  return {
    props: {
      loggedIn: !!session,
    },
  };
}
