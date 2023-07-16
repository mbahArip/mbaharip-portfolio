import { NextSeo, NextSeoProps } from 'next-seo';
import Link from 'next/link';
import { useRouter } from 'next/router';

import generateSeoProps from 'utils/generateSeoProps';

export default function InternalServer() {
  const router = useRouter();
  const seo: NextSeoProps = generateSeoProps({ title: 'Something went wrong' });
  return (
    <section
      id='not-found'
      className='flex-1 h-full w-full flex flex-col gap-2 items-center justify-center my-auto text-center'
    >
      <NextSeo {...seo} />
      <h1>Something went wrong</h1>
      <p className='text-center'>
        This is not your fault! It&apos;s likely a temporary problem on our end.
      </p>
      <p>Please try again later.</p>
      <div className='flex items-center gap-2'>
        <Link
          href='/'
          className='my-4'
        >
          <button>Go back to home</button>
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            router.reload();
          }}
        >
          Refresh
        </button>
      </div>
    </section>
  );
}
