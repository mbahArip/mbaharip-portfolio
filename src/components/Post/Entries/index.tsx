import Link from 'next/link';

import Img from 'components/Img';

import capitalize from 'utils/capitalize';
import formatDate from 'utils/formatDate';

import { Post } from 'types/post';

type Props = {
  data: Post;
  index?: number;
  showArrow?: boolean;
};

export default function BlogEntries({ data, index }: Props) {
  return (
    <Link
      href={data.path ?? '/'}
      className='border-b relative border-zinc-700 py-2 last-of-type:border-b-0 w-full flex flex-col flex-grow-0 flex-shrink-0 gap-2 group transition transition-smooth hover:bg-zinc-950 px-2'
    >
      <Img
        src={data.thumbnail ?? '/img/no-image.webp'}
        alt={data.title}
        width={512}
        className='rounded w-full h-32 max-h-32 object-cover'
      />
      <div className='h-full w-full flex flex-col gap-2 flex-1 justify-between'>
        <div className='w-full flex flex-col gap-1'>
          <h5 className='leading-normal line-clamp-1'>
            {capitalize(data.title)}
          </h5>
          <span className='text-zinc-500 text-xs flex-shrink-0 flex-grow-0 w-fit leading-none'>
            {formatDate(data.createdAt, true)}
          </span>
          <p className='text-zinc-300 flex-1 h-full text-sm m-0 line-clamp-2 break-all whitespace-pre-wrap'>
            {data.summary}
          </p>
        </div>
        <div className='w-full h-fit flex gap-1 items-center'>
          {data.tags.map((tag) => (
            <span
              key={tag}
              className='badge'
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
