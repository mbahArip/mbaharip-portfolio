import { GetServerSidePropsContext } from 'next';
import { NextSeo, NextSeoProps } from 'next-seo';
import { useState } from 'react';
import { VscClose, VscSearch } from 'react-icons/vsc';

import Loading from 'components/Loading';
import BlogEntries from 'components/Post/Entries';

import generateSeoProps from 'utils/generateSeoProps';

import { APIResponse } from 'types/api';
import { Post } from 'types/post';

type Props = {
  blogs: APIResponse<Post[]>;
  query: {
    page: number;
    q: string;
  };
};

export default function PageBlogs({ blogs: ssrBlogs, query }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>(query.q);

  const [blogs, setBlogs] = useState<Post[]>(ssrBlogs.data ?? []);
  const [currentPage, setCurrentPage] = useState<number>(query.page ?? 1);
  const [isNextPage, setIsNextPage] = useState<boolean>(
    ssrBlogs.pagination?.isNextPage ?? false,
  );

  const searchHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyword) return;
    setIsLoading(true);

    const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/blogs`);
    url.searchParams.append('q', keyword);
    url.searchParams.append('page', '1');

    const blogs = (await fetch(url.toString()).then((res) =>
      res.json(),
    )) as APIResponse<Post[]>;

    setBlogs(blogs.data ?? []);
    setCurrentPage(blogs.pagination?.currentPage ?? 1);
    setIsNextPage(blogs.pagination?.isNextPage ?? false);

    setIsLoading(false);
  };
  const resetHandler = async () => {
    setIsLoading(true);

    setKeyword('');
    const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/blogs`);
    url.searchParams.append('page', '1');

    const blogs = (await fetch(url.toString()).then((res) =>
      res.json(),
    )) as APIResponse<Post[]>;

    setBlogs(blogs.data ?? []);
    setCurrentPage(blogs.pagination?.currentPage ?? 1);
    setIsNextPage(blogs.pagination?.isNextPage ?? false);

    setIsLoading(false);
  };
  const loadMoreHandler = async () => {
    setIsLoading(true);

    const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/blogs`);
    url.searchParams.append('q', keyword);
    url.searchParams.append('page', (currentPage + 1).toString());

    const blogs = (await fetch(url.toString()).then((res) =>
      res.json(),
    )) as APIResponse<Post[]>;

    setBlogs((prevBlogs) => [...prevBlogs, ...(blogs.data ?? [])]);
    setCurrentPage(blogs.pagination?.currentPage ?? 1);
    setIsNextPage(blogs.pagination?.isNextPage ?? false);

    setIsLoading(false);
  };
  const seo: NextSeoProps = generateSeoProps({
    title: 'Blogs',
    url: '/blogs',
  });

  return (
    <>
      <NextSeo {...seo} />
      {/* <NextSeo
        title='Blogs'
        openGraph={{
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/blogs`,
          title: 'Blogs | mbahArip',
          type: 'website',
          description: `Hello, I&apos;m Arief Rachmawan, a developer based in Bandung, Indonesia.`,
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/img/banner.webp`,
              width: 1200,
              height: 630,
            },
          ],
          siteName: 'Blogs | mbahArip',
        }}
        twitter={{
          cardType: 'summary_large_image',
          handle: '@mbahArip_',
          site: '@mbahArip_',
        }}
        facebook={{
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID as string,
        }}
        additionalMetaTags={[
          {
            name: 'twitter:title',
            content: 'Blogs | mbahArip',
          },
          {
            name: 'twitter:description',
            content: `Hello, I&apos;m Arief Rachmawan, a developer based in Bandung, Indonesia.`,
          },
          {
            name: 'twitter:image',
            content: `${process.env.NEXT_PUBLIC_SITE_URL}/img/banner.webp`,
          },
        ]}
        key={'seo-blogs'}
      /> */}
      <section
        id='header'
        className='relative mx-auto w-full'
      >
        <div className='w-full flex flex-col md:flex-row items-start md:items-end justify-between'>
          <h1>Blog posts</h1>
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
            id='blog-posts'
            className='grid grid-cols-1 md:grid-cols-2 gap-x-16'
          >
            {blogs.length === 0 ? (
              <div className='w-full col-span-full flex items-center justify-center my-8 flex-col'>
                <h4 className='text-center'>No blog posts found.</h4>
                <span>
                  Can&apos;t find posts with keyword &quot;
                  <b>{keyword}</b>
                  &quot;.
                </span>
                <span>Try searching with different keyword.</span>
              </div>
            ) : (
              <>
                {blogs.map((blog) => (
                  <BlogEntries
                    key={blog.title}
                    data={blog}
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
  const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/blogs`);
  if (page) url.searchParams.append('page', page as string);
  if (q) url.searchParams.append('q', q as string);

  const blogs = (await fetch(url.toString()).then((res) =>
    res.json(),
  )) as APIResponse<Post[]>;

  return {
    props: {
      blogs,
      query: {
        page: parseInt(page as string) ?? 1,
        q: (q as string) ?? '',
      },
    },
  };
}
