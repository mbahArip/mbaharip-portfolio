import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { SpecialComponents } from 'react-markdown/lib/ast-to-react';
import { NormalComponents } from 'react-markdown/lib/complex-types';
import rehypePrism from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkSlug from 'remark-slug';
import remarkToc from 'remark-toc';

type Props = {
  children: string;
};

const customComponents: Partial<
  Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
> = {
  img({ alt, src, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        className='w-full max-w-sm mx-auto object-cover rounded-lg border-4 border-zinc-300 bg-zinc-300 cursor-pointer'
        onClick={() => window.open(src, '_blank')}
      />
    );
  },
  a({ href, ...props }: any) {
    if (href.startsWith('#')) {
      const slug = href.split('#')[1];
      return (
        <a
          href={href}
          className='opacity-80 hover:opacity-100 transition transition-smooth'
          onClick={(e) => {
            e.preventDefault();
            const targetHeading = document.getElementById(slug);
            if (targetHeading) {
              const headerOffset = 72;
              const targetHeadingPos =
                targetHeading.getBoundingClientRect().top;
              const scrollPos =
                targetHeadingPos + window.scrollY - headerOffset;

              window.scrollTo({
                top: scrollPos,
                behavior: 'smooth',
              });
            }
          }}
        >
          <span className={`text-sm cursor-pointer`}>{props.children}</span>
        </a>
      );
    }
    return (
      <Link
        href={href}
        {...props}
      >
        {props.children}
      </Link>
    );
  },
  h3({ children, ...props }: any) {
    return (
      <>
        <hr />
        <h3 {...props}>{children}</h3>
      </>
    );
  },
};

export default function MarkdownRender({ children }: Props) {
  return (
    <div className={'markdown w-full'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkSlug, remarkToc]}
        rehypePlugins={[rehypeRaw, [rehypePrism, { ignoreMissing: true }]]}
        components={customComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
