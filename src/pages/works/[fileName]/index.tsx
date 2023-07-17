import matter from 'gray-matter';
import { GetStaticPropsContext } from 'next';
import { ArticleJsonLd, NextSeo, NextSeoProps } from 'next-seo';

import PostContent from 'components/Post/Content';
import PostHeader from 'components/Post/Header';

import generateSeoProps from 'utils/generateSeoProps';
import octokit from 'utils/octokit';

import { GithubFile } from 'types/github';
import { Post, PostDetails } from 'types/post';

type Props = {
  work: PostDetails;
  toc: {
    level: number;
    text: string;
    slug: string;
  }[];
  nextPost?: Post;
  prevPost?: Post;
};

export default function PageWork({ work, toc, nextPost, prevPost }: Props) {
  const seo: NextSeoProps = generateSeoProps({
    title: work.metadata.title,
    description: work.metadata.summary,
    url: work.metadata.path,
    type: 'article',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}${work.metadata.thumbnail}`,
        width: 800,
        height: 600,
      },
    ],
    article: {
      tags: work.metadata.tags,
      publishedTime: new Date(work.metadata.createdAt).toISOString(),
      modifiedTime: new Date(work.metadata.updatedAt).toISOString(),
      authors: ['Arief Rachmawan'],
    },
  });

  return (
    <>
      <NextSeo
        {...seo}
        canonical={`${process.env.NEXT_PUBLIC_SITE_URL}`}
      />
      <ArticleJsonLd
        type='BlogPosting'
        url={`${process.env.NEXT_PUBLIC_SITE_URL}${work.metadata.path}`}
        title={work.metadata.title}
        images={[
          `${process.env.NEXT_PUBLIC_SITE_URL}${work.metadata.thumbnail}`,
        ]}
        datePublished={new Date(work.metadata.createdAt).toISOString()}
        dateModified={new Date(work.metadata.updatedAt).toISOString()}
        authorName={['Arief Rachmawan']}
        description={work.metadata.summary}
      />
      <article>
        <PostHeader post={work} />
        <hr />
        <PostContent
          post={work}
          toc={toc}
          nextPost={nextPost}
          prevPost={prevPost}
        />
      </article>
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const { fileName } = context.params || {};
  if (!fileName) return { notFound: true };

  const { data } = (await octokit.rest.repos.getContent({
    owner: 'mbaharip',
    path: `works/${fileName}.md`,
    repo: 'mbaharip-blog-posts',
  })) as Partial<{ data: GithubFile }>;

  if (!data) return { notFound: true };
  if (data.type !== 'file') return { notFound: true };

  const rawContent = Buffer.from(data.content, 'base64').toString('utf-8');
  const markdownData = matter(rawContent);
  let markdownContent = markdownData.content;

  if (markdownContent.startsWith('\n')) {
    markdownContent = markdownContent.slice(1);
  }

  markdownContent = markdownContent.replace(
    /!\[\[([^\]]+)\]\]/g,
    '![$1](/api/attachments/$1)',
  );

  markdownContent = markdownContent.replace(
    /\[\[([^\]]+)\]\]/g,
    '[$1](/api/attachments/$1)',
  );

  // Get all h1 - h3 for table of contents from markdownContent
  const headings = markdownContent.match(/#{1,3}\s(.+)/g) ?? [];
  const toc = headings.map((heading) => {
    const level = heading.match(/#/g)?.length ?? 0;
    const text = heading.replace(/#+\s/g, '');
    const slug = text
      .toLowerCase()
      .replace(/\s/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    return {
      level,
      text,
      slug,
    };
  });

  let tags = [];
  if (Array.isArray(markdownData.data.tags) && markdownData.data.tags[0]) {
    tags = markdownData.data.tags;
  }

  const summary = markdownContent
    .replace(/!\[.*?\]\((.*?)\)/g, '')
    .replace(/\[(.*?)\]/g, '')
    .replace(/\[\[([^\]]+)\]\]/g, '')
    .replace(/!\[\[([^\]]+)\]\]/g, '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/#+\s/g, '')
    .split('\n')
    .slice(0, 3)
    .join(' ')
    .trim();

  let thumbnail = markdownData.data.thumbnail ?? '/img/banner.webp';
  if (/!\[\[([^\]]+)\]\]/g.test(thumbnail)) {
    thumbnail = thumbnail.match(/!\[\[([^\]]+)\]\]/)?.[1] ?? 'logo.webp';
    thumbnail = `/api/attachments/banner/${thumbnail}`;
  } else {
    thumbnail = thumbnail.replace(/"/g, '').replace(/\\/g, '');
  }

  const postData: PostDetails = {
    content: markdownContent,
    metadata: {
      title:
        markdownData.data.title ?? data.name.replace('.md', '') ?? 'Untitled',
      summary,
      thumbnail: thumbnail ?? null,
      thumbnail_x: markdownData.data.thumbnail_x ?? 0.5,
      thumbnail_y: markdownData.data.thumbnail_y ?? 0.5,
      tags,
      createdAt: markdownData.data.created ?? new Date().toISOString(),
      updatedAt: markdownData.data.updated ?? new Date().toISOString(),
      repositoryUrl: markdownData.data.repositoryUrl ?? undefined,
      demoUrl: markdownData.data.demoUrl ?? undefined,
    },
  };

  // Get next and previous post
  const { data: worksIndex } = (await octokit.rest.repos.getContent({
    owner: 'mbaharip',
    path: '@db/worksIndex.json',
    repo: 'mbaharip-blog-posts',
  })) as Partial<{ data: GithubFile }>;

  if (!worksIndex) return { notFound: true };

  const rawworksIndex = Buffer.from(worksIndex.content, 'base64').toString(
    'utf-8',
  );
  const works = (JSON.parse(rawworksIndex) as Post[]).reverse();

  const currentPostIndex = works.findIndex(
    (work) => work.path === `/works/${fileName}`,
  );

  const nextPost = works[currentPostIndex + 1] ?? null;
  const prevPost = works[currentPostIndex - 1] ?? null;

  return {
    props: {
      work: postData,
      toc,
      nextPost,
      prevPost,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const { data } = (await octokit.rest.repos.getContent({
    owner: 'mbaharip',
    path: '@db/worksIndex.json',
    repo: 'mbaharip-blog-posts',
  })) as Partial<{ data: GithubFile }>;

  if (!data) return { notFound: true };

  const rawContent = Buffer.from(data.content, 'base64').toString('utf-8');
  const works = JSON.parse(rawContent) as Post[];

  const paths = works.map((work) => ({
    params: { fileName: work.path?.split('/').pop() },
  }));

  return {
    paths: paths ?? [],
    fallback: 'blocking',
  };
}
