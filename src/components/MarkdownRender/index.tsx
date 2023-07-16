import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { SpecialComponents } from 'react-markdown/lib/ast-to-react';
import { NormalComponents } from 'react-markdown/lib/complex-types';
import rehypePrism from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
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
      <div className='w-full flex items-center justify-center'>
        <img
          src={src}
          alt={alt}
          className='w-full max-w-screen-sm object-cover rounded-lg border-4 border-zinc-300 bg-zinc-300'
        />
      </div>
    );
  },
  a({ href, ...props }: any) {
    return (
      <Link
        href={href}
        {...props}
      >
        {props.children}
      </Link>
    );
  },
};

export default function MarkdownRender({ children }: Props) {
  return (
    <div className={'markdown w-full'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkSlug, remarkToc, remarkBreaks]}
        rehypePlugins={[rehypeRaw, [rehypePrism, { ignoreMissing: true }]]}
        components={customComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
