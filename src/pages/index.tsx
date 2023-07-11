import Link from 'next/link';
import {
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si';

import BlogEntries from 'components/Blog/Entries';
import TextKey from 'components/TextKey';

import capitalize from 'utils/capitalize';

import { User } from 'types/about';
import { GithubSocial } from 'types/github';
import { Post } from 'types/post';

type Props = {
  user: User;
  blogs: Post[];
  works: Post[];
  socials: GithubSocial[];
  data: Record<string, string | string[] | boolean | number>;
};

export default function Home({ user, blogs, works, socials, data }: Props) {
  return (
    <>
      <section id='profile'>
        <div className='w-full flex items-center justify-center flex-col relative mb-10 md:mb-14'>
          <img
            src='https://cdn.discordapp.com/attachments/256771512445566976/1127608431973519440/image.png'
            alt='profileBanner'
            loading='lazy'
            className='w-full h-32 md:h-64 object-cover object-center rounded-xl'
          />
          <img
            src={user.avatar_url}
            alt={user.login}
            loading='lazy'
            className='w-20 border-4 md:border-6 border-black md:w-28 aspect-square object-cover rounded-full absolute -bottom-10 md:-bottom-14'
          />
        </div>
        <div className='w-full flex items-center justify-center flex-col'>
          <span className='text-xl font-bold'>{user.name}</span>
          <span className='text-zinc-500'>@{user.login}</span>
          <span className='text-zinc-300'>{user.bio}</span>
        </div>
      </section>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4'>
        <section
          id='about-me'
          className='md:text-lg w-full h-fit my-4 md:my-8 max-w-screen-sm mx-auto flex flex-col items-start justify-center'
        >
          <h3>About me</h3>
          <hr />
          <p className='w-full text-start md:text-start'>
            Hello! I&apos;m <TextKey>{user.name}</TextKey>, a
            <TextKey index={1}>Developer</TextKey> based in
            <TextKey index={2}>{user.location}</TextKey>. I&apos;m currently a
            student at{' '}
            <Link
              href={'https://sttbandung.ac.id/'}
              target='_blank'
            >
              Sekolah Tinggi Tekonologi Bandung
            </Link>{' '}
            pursuing a Bachelor&apos;s degree in Computer Science.
          </p>
          <p>
            Currently I&apos;m working on:{' '}
            {data.workingOn && data.workingOnURL ? (
              <Link
                href={data.workingOnURL as string}
                target='_blank'
              >
                {data.workingOn as string}
              </Link>
            ) : (
              <span>-</span>
            )}
          </p>
          <div className='max-w-screen-sm w-full my-4'>
            My preferred tech-stack includes: <br />
            <div className='flex w-full flex-wrap items-center gap-1'>
              <TextKey
                index={3}
                className='inline-flex h-fit w-fit items-center gap-1'
              >
                <SiReact
                  size={18}
                  className='text-blue-400'
                />
                React
              </TextKey>
              <TextKey
                index={4}
                className='inline-flex h-fit w-fit items-center gap-1'
              >
                <SiNextdotjs size={18} />
                Next
              </TextKey>
              <TextKey
                index={5}
                className='inline-flex h-fit w-fit items-center gap-1'
              >
                <SiTailwindcss
                  size={18}
                  className='text-cyan-300'
                />
                Tailwind
              </TextKey>
              <TextKey
                index={6}
                className='inline-flex h-fit w-fit items-center gap-1'
              >
                <SiTypescript
                  size={18}
                  className='text-blue-500'
                />
                Typescript
              </TextKey>
            </div>
          </div>
          <hr />
          <div className='w-full flex flex-col items-center justify-center'>
            <span>You can find me on:</span>
            <div className='flex items-center justify-center gap-2'>
              {socials.map((social) => (
                <Link
                  key={social.provider}
                  href={social.url}
                  target='_blank'
                >
                  {capitalize(social.provider)}
                </Link>
              ))}
            </div>

            <span>
              Or send me an email at{' '}
              <a href='mailto:me@mbaharip.com'>me@mbaharip.com</a>
            </span>
          </div>
        </section>

        <section
          id='latest'
          className='w-full grid grid-cols-1 md:grid-cols-1 h-fit my-4 md:my-8 gap-x-16 gap-y-4'
        >
          <div className='w-full flex flex-col'>
            <h3>Latest projects</h3>
            <hr />
            <ul className='w-full flex items-center justify-center flex-col'>
              {works.map((blog, index) => (
                <BlogEntries
                  key={blog.title}
                  data={blog}
                  index={index}
                />
              ))}
            </ul>
          </div>
          <div className='w-full flex flex-col'>
            <h3>New blog posts</h3>
            <hr />
            <ul className='w-full flex items-center justify-center flex-col'>
              {blogs.map((blog, index) => (
                <BlogEntries
                  key={blog.title}
                  data={blog}
                  index={index}
                />
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const ghHeader = {
    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const fetchUser = fetch('https://api.github.com/users/mbaharip', {
    headers: ghHeader,
  });
  const fetchSocials = fetch(
    'https://api.github.com/users/mbaharip/social_accounts',
    {
      headers: ghHeader,
    },
  );
  const fetchData = fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/data`);
  const fetchBlogs = fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/blogs?perPage=3`,
  );
  const fetchWorks = fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/works?perPage=3`,
  );

  // await all, then return as json
  const [user, socials, data, blogs, works] = await Promise.all([
    fetchUser,
    fetchSocials,
    fetchData,
    fetchBlogs,
    fetchWorks,
  ]).then((responses) =>
    Promise.all(responses.map((response) => response.json())),
  );

  console.log(user, socials, blogs, works);

  return {
    props: {
      user: user as User,
      socials: socials as GithubSocial[],
      blogs: blogs.data as Post[],
      works: works.data as Post[],
      data: data.data as Record<string, string | string[] | boolean | number>,
    },
  };
}
