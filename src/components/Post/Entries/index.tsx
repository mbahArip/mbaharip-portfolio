import Link from 'next/link';
import { VscChevronRight } from 'react-icons/vsc';

import Img from 'components/Img';

import capitalize from 'utils/capitalize';
import formatDate from 'utils/formatDate';

import { Post } from 'types/post';

type Props = {
  data: Post;
  index?: number;
  showArrow?: boolean;
};

export default function BlogEntries({ data, index, showArrow = true }: Props) {
  return (
    <Link
      href={data.path ?? '/'}
      className='border-b relative border-zinc-700 py-4 last-of-type:border-b-0 w-full flex flex-grow-0 flex-shrink-0 gap-2 group transition transition-smooth hover:bg-zinc-950 px-2'
    >
      <Img
        src={data.thumbnail ?? '/img/no-image.webp'}
        alt={data.title}
        width={128}
        className='w-24 aspect-square object-cover rounded'
      />
      <div className='h-24 w-auto flex flex-col flex-1 justify-between'>
        <div className='w-full flex flex-col'>
          <h5 className='leading-normal line-clamp-1'>
            {capitalize(data.title)}
          </h5>
          <p className='text-zinc-300 text-sm m-0 line-clamp-2 break-all whitespace-pre-wrap'>
            {data.summary}
          </p>
        </div>
        <div className='w-full h-fit flex items-center justify-between gap-2'>
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
          <span className='text-zinc-500 text-xs flex-shrink-0 flex-grow-0 w-fit leading-none'>
            {formatDate(data.createdAt)}
          </span>
        </div>
      </div>
      {showArrow ? (
        <div className='w-fit h-full flex-grow-0 flex-shrink-0 p-0 md:p-2 grid place-items-center relative transition-all transition-smooth'>
          <VscChevronRight
            size={24}
            className='relative left-0 group-hover:left-2 transition-all transition-smooth'
          />
        </div>
      ) : (
        <></>
      )}
    </Link>
  );
}
