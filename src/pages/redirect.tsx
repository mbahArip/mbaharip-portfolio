import { Button, Card, CardBody, CardFooter, CardHeader, Checkbox, Snippet } from '@nextui-org/react';
import { GetServerSidePropsContext } from 'next';

import DefaultLayout from 'components/Layout/DefaultLayout';
import Link from 'components/Link';

interface RedirectProps {
  url: string;
  prevPath: string;
}
export default function Redirect({ url, prevPath }: RedirectProps) {
  return (
    <DefaultLayout
      seo={{
        title: 'Redirecting',
        description: 'Making sure you are comfortable with the redirect.',
      }}
    >
      <div className='center-max-xl flex flex-grow items-center justify-center'>
        <Card
          classNames={{
            base: 'w-full max-w-screen-md',
            footer: 'flex-col gap-2 items-start',
          }}
        >
          <CardHeader>
            <h1 className='text-2xl font-semibold'>Redirecting</h1>
          </CardHeader>
          <CardBody>
            <span>Are you sure want to open this link?</span>
            <Snippet symbol='>'>{url}</Snippet>
            <div className='mt-2 flex flex-col gap-1'>
              <span className='text-tiny text-default-400'>
                The link you are trying to open is not on <span className='font-bold'>mbaharip.com</span> domain. It
                might be dangerous to open this link.
              </span>
              <span className='text-tiny text-danger'>
                Please be careful when opening link from <b>other user comment</b>. I am not responsible for any damage
                caused.
                <br />
                My comment will always have a <b>Author</b> badge on it.
              </span>
            </div>
          </CardBody>
          <CardFooter>
            <Checkbox
              classNames={{
                label: 'text-small',
              }}
              onChange={(e) => {
                if (e.target.checked) {
                  const expires = new Date();
                  expires.setFullYear(expires.getFullYear() + 1);
                  document.cookie = `unsafe_redirects=allow; path=/; expires=${expires.toUTCString()}; SameSite=Strict;`;
                } else {
                  document.cookie = `unsafe_redirects=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;`;
                }
              }}
            >
              Always redirect me without asking
            </Checkbox>

            <div className='flex w-full items-center justify-end gap-2'>
              <Button
                as={Link}
                href={prevPath}
                color='secondary'
                variant='light'
              >
                Back to safety
              </Button>
              <Button
                as={Link}
                href={url}
                color='danger'
                variant='shadow'
              >
                Redirect me
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      {/* <span>Redirect to {url}</span>
      <input
        type='checkbox'
        onChange={(e) => {
          if (e.target.checked) {
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 1);
            document.cookie = `unsafe_redirects=allow; path=/; expires=${expires.toUTCString()}; SameSite=Strict;`;
          } else {
            document.cookie = `unsafe_redirects=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;`;
          }
        }}
      /> */}
    </DefaultLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { url, ref } = context.query;

  if (!url) return { notFound: true };
  const redirectCookies = context.req.cookies['unsafe_redirects'];
  if (redirectCookies === 'allow') {
    return {
      redirect: {
        destination: url as string,
        permanent: false,
      },
    };
  }

  return {
    props: {
      url,
      prevPath: ref ?? '/',
    },
  };
}
