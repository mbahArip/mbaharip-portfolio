import { GetServerSidePropsContext } from 'next';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useState } from 'react';
import { VscClose, VscSearch } from 'react-icons/vsc';

import Loading from 'components/Loading';
import WorkEntries from 'components/Post/Entries';

import generateSeoProps from 'utils/generateSeoProps';

import { APIResponse } from 'types/api';
import { Post } from 'types/post';

type Props = {
  works: APIResponse<Post[]>;
  query: {
    page: number;
    q: string;
  };
};

export default function PageWorks({ works: ssrWorks, query }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>(query.q);

  const [works, setWorks] = useState<Post[]>(ssrWorks.data ?? []);
  const [currentPage, setCurrentPage] = useState<number>(query.page ?? 1);
  const [isNextPage, setIsNextPage] = useState<boolean>(
    ssrWorks.pagination?.isNextPage ?? false,
  );

  const searchHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyword) return;
    setIsLoading(true);

    const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/works`);
    url.searchParams.append('q', keyword);
    url.searchParams.append('page', '1');

    const works = (await fetch(url.toString()).then((res) =>
      res.json(),
    )) as APIResponse<Post[]>;

    setWorks(works.data ?? []);
    setCurrentPage(works.pagination?.currentPage ?? 1);
    setIsNextPage(works.pagination?.isNextPage ?? false);

    setIsLoading(false);
  };
  const resetHandler = async () => {
    setIsLoading(true);

    setKeyword('');
    const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/works`);
    url.searchParams.append('page', '1');

    const works = (await fetch(url.toString()).then((res) =>
      res.json(),
    )) as APIResponse<Post[]>;

    setWorks(works.data ?? []);
    setCurrentPage(works.pagination?.currentPage ?? 1);
    setIsNextPage(works.pagination?.isNextPage ?? false);

    setIsLoading(false);
  };
  const loadMoreHandler = async () => {
    setIsLoading(true);

    const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/works`);
    url.searchParams.append('q', keyword);
    url.searchParams.append('page', (currentPage + 1).toString());

    const works = (await fetch(url.toString()).then((res) =>
      res.json(),
    )) as APIResponse<Post[]>;

    setWorks((prevWorks) => [...prevWorks, ...(works.data ?? [])]);
    setCurrentPage(works.pagination?.currentPage ?? 1);
    setIsNextPage(works.pagination?.isNextPage ?? false);

    setIsLoading(false);
  };
  const seo: NextSeoProps = generateSeoProps({
    title: 'Works / Projects',
    url: '/works',
  });

  return (
    <>
      <NextSeo {...seo} />
      <section
        id='header'
        className='relative mx-auto w-full'
      >
        <div className='w-full flex flex-col md:flex-row items-start md:items-end justify-between'>
          <h1>Works / Projects</h1>
          <form
            className='flex w-full gap-1 items-center max-w-sm'
            onSubmit={(e) => {
              e.preventDefault();
              searchHandler(e);
            }}
            onReset={(e) => {
              e.preventDefault();
              resetHandler();
            }}
          >
            <div className='relative flex items-center w-full'>
              <input
                type='text'
                placeholder='Search'
                className='w-full pr-8'
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword ? (
                <VscClose
                  size={18}
                  className='absolute right-2 text-gray-300 hover:text-white transition transition-smooth cursor-pointer'
                  onClick={() => resetHandler()}
                />
              ) : (
                <></>
              )}
            </div>
            <button
              type='submit'
              className='w-fit flex items-center gap-1 py-2'
            >
              <VscSearch size={18} />
            </button>
          </form>
        </div>
      </section>
      <hr />
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <section
            id='work-posts'
            className='grid grid-cols-1 md:grid-cols-2 gap-x-16'
          >
            {works.length === 0 ? (
              <div className='w-full col-span-full flex items-center justify-center my-8 flex-col'>
                <h4 className='text-center'>No works / projects found.</h4>
                <span>
                  Can&apos;t find works / projects with keyword &quot;
                  <b>{keyword}</b>
                  &quot;.
                </span>
                <span>Try searching with different keyword.</span>
              </div>
            ) : (
              <>
                {works.map((work) => (
                  <WorkEntries
                    key={work.title}
                    data={work}
                    showArrow={false}
                  />
                ))}
              </>
            )}
          </section>
          <section
            id='pagination'
            className='flex items-center w-full max-w-sm mx-auto my-4'
          >
            {isNextPage ? (
              <button
                className='w-full'
                onClick={(e) => {
                  e.preventDefault();
                  loadMoreHandler();
                }}
              >
                Load more...
              </button>
            ) : (
              <></>
            )}
          </section>
        </>
      )}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { page, q } = context.query;
  const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/works`);
  if (page) url.searchParams.append('page', page as string);
  if (q) url.searchParams.append('q', q as string);

  const works = (await fetch(url.toString()).then((res) =>
    res.json(),
  )) as APIResponse<Post[]>;

  return {
    props: {
      works,
      query: {
        page: parseInt(page as string) ?? 1,
        q: (q as string) ?? '',
      },
    },
  };
}
