import Link from 'next/link';

export default function NotFound() {
  return (
    <section
      id='not-found'
      className='flex-1 h-full w-full flex flex-col gap-2 items-center justify-center my-auto'
    >
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
