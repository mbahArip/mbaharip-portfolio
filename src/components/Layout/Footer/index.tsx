import Link from 'components/Link';

export default function Footer() {
  return (
    <footer className='relative z-50 flex w-full flex-col items-center justify-center py-4'>
      <span className='text-small text-default-400'>{new Date().getFullYear()} ・ mbaharip</span>
      <span className='text-small text-default-400'>
        Built using{' '}
        <Link
          className='text-small'
          href='https://nextjs.org'
        >
          Next.js
        </Link>{' '}
        and{' '}
        <Link
          className='text-small'
          href='https://nextui.org'
        >
          NextUI
        </Link>
      </span>
    </footer>
  );
}
