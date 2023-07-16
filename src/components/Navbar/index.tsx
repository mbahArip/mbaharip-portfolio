import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import { VscClose, VscGithub, VscMenu } from 'react-icons/vsc';

const navLinks: { name: ReactNode; href: string; target?: string }[] = [
  {
    name: <span>Blogs</span>,
    href: '/blogs',
  },
  {
    name: <span>Works / Projects</span>,
    href: '/works',
  },
  {
    name: (
      <span className='flex w-fit items-center gap-2'>
        <VscGithub size={18} /> Source Code
      </span>
    ),
    href: 'https://github.com/mbahArip/mbaharip-portfolio',
    target: '_blank',
  },
];

export default function Navbar() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <nav className='w-full flex flex-col items-center justify-center sticky top-0 md:px-0 max-w-screen-lg mx-auto z-[9999]'>
      <div className='flex bg-black items-center justify-between w-full px-2 py-2 md:py-4 sticky top-0 z-[9999]'>
        <Link
          href='/'
          className='flex gap-2 items-center'
        >
          <img
            src='/logo.svg'
            alt='mbaharip'
            className='w-8 h-8'
          />
          <span className='font-bold text-xl hidden md:block font-heading'>
            mbahArip
          </span>
        </Link>

        <span className='block md:hidden font-bold text-xl font-heading'>
          mbahArip
        </span>

        <div className='flex items-center justify-center md:hidden relative w-8 h-8'>
          <VscMenu
            className={`w-6 h-6 absolute top-auto transition transition-smooth ${
              isMenuOpen
                ? 'opacity-0 rotate-180 pointer-events-none'
                : 'opacity-100 rotate-0 pointer-events-auto'
            }`}
            onClick={() => setIsMenuOpen(true)}
          />
          <VscClose
            className={`w-8 h-8 absolute top-auto transition transition-smooth ${
              isMenuOpen
                ? 'opacity-100 rotate-0 pointer-events-auto'
                : 'opacity-0 rotate-180 pointer-events-none'
            }`}
            onClick={() => setIsMenuOpen(false)}
          />
        </div>

        <ul className='hidden md:flex items-center gap-2'>
          {navLinks.map(({ name, href, target }) => (
            <li key={href}>
              <Link
                href={href}
                target={target ?? undefined}
                className={`px-4 py-1 text-center inline-flex items-center hover:opacity-100 transition-opacity transition-smooth ${
                  router.asPath.includes(href)
                    ? 'opacity-100 font-bold'
                    : 'opacity-80'
                }`}
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`flex-1 w-full backdrop-blur h-full md:hidden fixed py-16 bg-black/75 z-[9998] ${
          isMenuOpen ? 'top-0 opacity-100' : '-top-full opacity-0'
        } transition-all transition-smooth`}
      >
        <ul className='flex w-full flex-col'>
          <li
            className={`w-full flex px-4 py-2 ${
              router.asPath === '/' ? 'bg-white text-black' : ''
            }`}
          >
            <Link
              href={'/'}
              className={`opacity-100 w-full flex-1 text-xl transition-opacity transition-smooth ${
                router.asPath === '/' ? 'opacity-100 font-bold' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Home</span>
            </Link>
          </li>
          {navLinks.map(({ name, href, target }) => (
            <li
              key={href}
              className={`w-full flex px-4 py-2 ${
                router.asPath.includes(href) ? 'bg-white text-black' : ''
              }`}
            >
              <Link
                href={href}
                target={target ?? undefined}
                className={`opacity-100 w-full inline-flex items-center justify-start gap-1 flex-1 text-xl transition-opacity transition-smooth ${
                  router.asPath.includes(href) ? 'opacity-100 font-bold' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
