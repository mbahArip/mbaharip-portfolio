import Link from 'next/link';
import { SiGithub, SiGmail, SiTwitter } from 'react-icons/si';

const links: { title: string; href: string; icon: JSX.Element }[] = [
  {
    title: 'Email',
    href: 'mailto:me@mbaharip.com',
    icon: <SiGmail size={24} />,
  },
  {
    title: 'Github',
    href: 'https://github.com/mbaharip',
    icon: <SiGithub size={24} />,
  },
  {
    title: 'Twitter',
    href: 'https://twitter.com/mbaharip_',
    icon: <SiTwitter size={24} />,
  },
];

export default function Footer() {
  return (
    <footer className='w-full flex py-2 mb-4 md:mb-8 items-center justify-center text-sm text-zinc-500 relative z-[9997] flex-col'>
      <div className='flex gap-6 items-center justify-center w-full text-sm md:text-base my-2'>
        {links.map((link) => (
          <Link
            href={link.href}
            key={link.title}
            title={link.title}
            className='opacity-80 hover:opacity-100 transition transition-smooth text-white'
          >
            {link.icon}
          </Link>
        ))}
      </div>
      <span>&copy; {new Date().getFullYear()}・mbaharip</span>
      <span>
        Powered by{' '}
        <Link
          href={'https://nextjs.org/'}
          target='_blank'
        >
          Next.js
        </Link>
        ,{' '}
        <Link
          href={'https://tailwindcss.com'}
          target='_blank'
        >
          Tailwind
        </Link>
        , and{' '}
        <Link
          href={'https://vercel.com'}
          target='_blank'
        >
          Vercel
        </Link>
      </span>
    </footer>
  );
}
