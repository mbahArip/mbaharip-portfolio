import { Button, Card, CardBody, CardFooter, CardHeader, Image, Input } from '@nextui-org/react';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth/next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Icon from 'components/Icons';
import DefaultLayout from 'components/Layout/DefaultLayout';

import { handlerLogin } from 'mod/admin/auth';

import supabase from 'utils/client/supabase';

import { State } from 'types/Common';

import { authOptions } from '../api/auth/[...nextauth]';

interface AdminLoginProps {
  callbackUrl: string;
}
export default function AdminLogin({ callbackUrl }: AdminLoginProps) {
  const router = useRouter();

  const [loginState, setLoginState] = useState<State>('disabled');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    if (email && password) {
      setLoginState('idle');
    } else {
      setLoginState('disabled');
    }
  }, [email, password]);

  return (
    <div className='grid h-full w-full flex-grow place-items-center bg-gradient-to-t from-default-50 to-background'>
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
            body: 'gap-3',
          }}
        >
          <CardHeader>
            <Icon name='LogIn' />
            <h4>Login</h4>
          </CardHeader>
          <form
            onSubmit={(e) => {
              handlerLogin(
                e,
                {
                  email: {
                    get: email,
                    set: setEmail,
                  },
                  password: {
                    get: password,
                    set: setPassword,
                  },
                  btn: {
                    get: loginState,
                    set: setLoginState,
                  },
                },
                () => {
                  router.push(callbackUrl);
                },
              );
            }}
          >
            <CardBody>
              <Input
                placeholder='johndoe@acme.com'
                label='Email'
                labelPlacement='outside'
                type='email'
                value={email}
                onValueChange={setEmail}
              />
              <Input
                placeholder='********'
                label='Password'
                labelPlacement='outside'
                type='password'
                value={password}
                onValueChange={setPassword}
              />
            </CardBody>
            <CardFooter>
              <Button
                type='submit'
                variant='shadow'
                color={loginState === 'idle' ? 'primary' : 'default'}
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
      <div className='absolute left-0 top-0 h-screen w-screen'>
        <div className='absolute bottom-4 left-1/2 z-10 -translate-x-1/2'>
          <Image
            src='/logo.svg'
            alt='mbaharip logo'
            className='h-8'
            removeWrapper
          />
        </div>
        <div className='absolute left-0 top-0 z-0 h-screen w-screen overflow-hidden bg-login opacity-25' />
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { callbackUrl } = context.query;
  const domain =
    process.env.NODE_ENV === 'production' ? `https://${process.env.DOMAIN}` : `http://${process.env.DOMAIN}`;
  let redirectUrl: URL = new URL('/admin/dashboard', domain);
  if (callbackUrl) {
    const url = new URL(callbackUrl as string, domain);
    redirectUrl = url;
  }

  const session = await getServerSession(context.req, context.res, authOptions);
  if (session) {
    if (session.user?.name === 'mbaharip' && session.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      await supabase.auth.signInWithPassword({
        email: process.env.NEXT_PUBLIC_ADMIN_EMAIL as string,
        password: process.env.ADMIN_PASSWORD as string,
      });
      return {
        redirect: {
          destination: redirectUrl.pathname,
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      callbackUrl: redirectUrl.pathname,
    },
  };
}
