import Link from 'next/link';
import { VscChevronRight } from 'react-icons/vsc';

import Img from 'components/Img';

import formatDate from 'utils/formatDate';

import { Post } from 'types/post';

type Props = {
  data: Post;
  index?: number;
};

export default function BlogEntries({ data, index }: Props) {
  return (
    <Link
      href={data.path}
      className='border-b border-zinc-500 py-4 last-of-type:border-b-0 w-full flex gap-2 group transition transition-smooth'
    >
      <Img
        src={data.banner ?? '/img/no-image.webp'}
        alt={data.title}
        width={256}
        className='w-24 aspect-square object-cover rounded'
      />
      <div className='h-24 w-full flex-1 flex flex-col justify-between'>
        <div className='w-full flex flex-col'>
          <div className='w-full flex-1 flex items-center justify-between gap-2'>
            <h5 className='leading-normal line-clamp-1'>{data.title}</h5>
            <span className='text-zinc-500 text-xs flex-shrink-0 flex-grow-0'>
              {formatDate(data.created)}
            </span>
          </div>
          <p className='text-zinc-300 line-clamp-2 text-sm m-0'>
            {data.description}
          </p>
        </div>
        <div className='w-full h-fit flex gap-1 items-center'>
          {['#test', '#lorem'].map((tag) => (
            <span
              key={tag}
              className='badge'
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className='w-fit h-full flex-grow-0 flex-shrink-0 p-0 md:p-2 grid place-items-center relative transition-all transition-smooth'>
        <VscChevronRight
          size={24}
          className='relative left-0 group-hover:left-2 transition-all transition-smooth'
        />
      </div>
    </Link>
  );
}
