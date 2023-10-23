import { Button, Checkbox, Chip, Code, Divider, Image, Tooltip } from '@nextui-org/react';
import { LegacyRef, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypePrism from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';
import Link from 'components/Link';

import { State } from 'types/Common';

interface MarkdownRenderProps {
  children: string;
  isComments?: boolean;
}

type Components = Partial<{
  [TagName in keyof JSX.IntrinsicElements]:  // Class component:
    | (new (props: JSX.IntrinsicElements[TagName]) => JSX.ElementClass)
    // Function component:
    | ((props: JSX.IntrinsicElements[TagName]) => JSX.Element | string | null | undefined)
    // Tag name:
    | keyof JSX.IntrinsicElements;
}>;
const customComponents: Components = {
  img: (props) => {
    const { src, alt } = props;
    return (
      <Tooltip content={'Click to open image in new tab'}>
        <span className='flex w-full flex-col items-center gap-2'>
          <Image
            src={src}
            alt={alt}
            className='h-full cursor-pointer'
            classNames={{
              wrapper: 'border border-divider',
            }}
            onClick={() => window.open(src, '_blank')}
          />
          <span className='text-tiny text-default-400'>{alt}</span>
        </span>
      </Tooltip>
    );
  },
  a: (props) => {
    const { href, target, children } = props;
    return (
      <Link
        href={href}
        isExternal={target === '_blank'}
      >
        {children}
      </Link>
    );
  },
  pre: (props) => {
    const { className, children } = props;

    const lang = className
      ?.split(' ')
      .find((c) => c.startsWith('language-'))
      ?.replace('language-', '');

    return (
      <CustomPreComponent
        language={lang}
        className={twMerge(className)}
      >
        {children}
      </CustomPreComponent>
    );
  },
  code: (props) => {
    const { className, children } = props;

    if (typeof children === 'string') {
      return (
        <Code
          size='sm'
          className='border border-divider bg-content1 shadow-medium'
        >
          {children}
        </Code>
      );
    } else {
      return <code className={twMerge(className)}>{children}</code>;
    }
  },
  p: (props) => {
    const { children } = props;
    if (!children) {
      return (
        <div
          id='comment-prohibited-identifier'
          className='paragraph flex flex-col flex-wrap rounded-medium border-medium border-divider bg-background/25 p-2 text-small text-danger'
        >
          <span>This comment contains prohibited content and cannot be displayed.</span>
          <span>This comment will be deleted as soon as possible.</span>
          <Divider className='my-2' />
          <span className='text-base text-foreground'>You can only use paragraph, code, and link in comments.</span>
        </div>
      );
    }
    return <div className='paragraph'>{children}</div>;
  },
  input: (props) => {
    const { type, ...rest } = props;

    switch (type) {
      case 'checkbox':
        return (
          <Checkbox
            isSelected={props.checked}
            isReadOnly
            lineThrough
          />
        );
      default:
        return (
          <input
            type={type}
            {...rest}
          />
        );
    }
  },
  table: (props) => {
    return (
      <div className='relative z-0 my-4 flex w-full flex-col justify-between gap-4 overflow-auto rounded-large bg-content1 p-4 shadow-small'>
        <table className={props.className}>{props.children}</table>
      </div>
    );
  },
};

export default function MarkdownRender({ children, isComments }: MarkdownRenderProps) {
  return (
    <div className={twMerge('w-full', isComments ? 'markdown-comment' : 'markdown')}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkToc]}
        rehypePlugins={[rehypeRaw, [rehypePrism, { ignoreMissing: true }]]}
        allowedElements={isComments ? ['p', 'code', 'a', 'pre', 'span'] : undefined}
        urlTransform={(url, key, node) => {
          if (node.tagName === 'a') {
            return url.startsWith('/')
              ? `${process.env.NEXT_PUBLIC_DOMAIN}${url}`
              : `${process.env.NEXT_PUBLIC_DOMAIN}/redirect?url=${encodeURIComponent(url)}`;
          } else {
            return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_DOMAIN}${url}` : url;
          }
        }}
        components={customComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

MarkdownRender.defaultProps = {
  isComments: false,
};

interface PreProps extends React.HTMLAttributes<HTMLPreElement> {
  language?: string;
}
function CustomPreComponent(props: PreProps) {
  const codeRef = useRef<HTMLPreElement>();
  const [copyStatus, setCopyStatus] = useState<State>('idle');

  useEffect(() => {
    if (!codeRef.current) return;
    if (copyStatus !== 'idle') {
      const timeout = setTimeout(() => {
        setCopyStatus('idle');
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [copyStatus]);

  return (
    <span className='relative'>
      <span className='absolute left-0 top-0 flex w-full items-center justify-end gap-2 rounded-medium p-2'>
        <Chip
          size='sm'
          color='secondary'
          classNames={{
            content: 'capitalize',
          }}
        >
          {props.language ?? 'Unknown language'}
        </Chip>
        <Button
          size='sm'
          variant='light'
          color={copyStatus === 'success' ? 'success' : copyStatus === 'error' ? 'danger' : 'default'}
          isIconOnly
          onPress={() => {
            if (!codeRef.current) return;
            if (copyStatus !== 'idle') return;

            try {
              navigator.clipboard.writeText(codeRef.current.textContent as string);
              setCopyStatus('success');
            } catch (error: any) {
              console.error(error);
              setCopyStatus('error');
            }
          }}
        >
          <Icon
            name={copyStatus === 'success' ? 'Check' : copyStatus === 'error' ? 'X' : 'Copy'}
            size='sm'
          />
        </Button>
      </span>
      <pre
        ref={codeRef as LegacyRef<HTMLPreElement>}
        className={twMerge('code !rounded-medium border border-divider shadow-medium', props.className)}
      >
        {props.children}
      </pre>
    </span>
  );
}
