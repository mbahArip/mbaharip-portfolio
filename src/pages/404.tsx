import { NextSeo, NextSeoProps } from 'next-seo';
import Link from 'next/link';

import generateSeoProps from 'utils/generateSeoProps';

export default function NotFound() {
  const seo: NextSeoProps = generateSeoProps({ title: '404 Not Found' });
  return (
    <section
      id='not-found'
      className='flex-1 h-full w-full flex flex-col gap-2 items-center justify-center my-auto'
    >
      <NextSeo {...seo} />
      <h1>404 Not Found</h1>
      <span>The page you&apos;re looking for doesn&apos;t exist.</span>
      <span>Please check the URL and try again.</span>
      <Link
        href='/'
        className='my-4'
      >
        <button>Go back to home</button>
      </Link>
    </section>
  );
}
