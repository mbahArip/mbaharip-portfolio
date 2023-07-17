import matter from 'gray-matter';
import { GetStaticPropsContext } from 'next';
import { ArticleJsonLd, NextSeo, NextSeoProps } from 'next-seo';

import PostContent from 'components/Post/Content';
import PostHeader from 'components/Post/Header';

import generateSeoProps from 'utils/generateSeoProps';
import octokit from 'utils/octokit';

import { GithubFile } from 'types/github';
import { Post, PostDetails, PostToC } from 'types/post';

type Props = {
  blog: PostDetails;
  toc: PostToC[];
  nextPost?: Post;
  prevPost?: Post;
};

export default function PageBlog({ blog, toc, nextPost, prevPost }: Props) {
  const seo: NextSeoProps = generateSeoProps({
    title: blog.metadata.title,
    description: blog.metadata.summary,
    url: blog.metadata.path,
    type: 'article',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}${blog.metadata.thumbnail}`,
        width: 800,
        height: 600,
      },
    ],
    article: {
      tags: blog.metadata.tags,
      publishedTime: new Date(blog.metadata.createdAt).toISOString(),
      modifiedTime: new Date(blog.metadata.updatedAt).toISOString(),
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
        url={`${process.env.NEXT_PUBLIC_SITE_URL}${blog.metadata.path}`}
        title={blog.metadata.title}
        images={[
          `${process.env.NEXT_PUBLIC_SITE_URL}${blog.metadata.thumbnail}`,
        ]}
        datePublished={new Date(blog.metadata.createdAt).toISOString()}
        dateModified={new Date(blog.metadata.updatedAt).toISOString()}
        authorName={['Arief Rachmawan']}
        description={blog.metadata.summary}
      />
      <article>
        <PostHeader post={blog} />
        <hr />
        <PostContent
          post={blog}
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
    path: `blogs/${fileName}.md`,
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
    },
  };

  // Get next and previous post
  const { data: blogsIndex } = (await octokit.rest.repos.getContent({
    owner: 'mbaharip',
    path: '@db/blogsIndex.json',
    repo: 'mbaharip-blog-posts',
  })) as Partial<{ data: GithubFile }>;

  if (!blogsIndex) return { notFound: true };

  const rawBlogsIndex = Buffer.from(blogsIndex.content, 'base64').toString(
    'utf-8',
  );
  const blogs = (JSON.parse(rawBlogsIndex) as Post[]).reverse();

  const currentPostIndex = blogs.findIndex(
    (blog) => blog.path === `/blogs/${fileName}`,
  );

  const nextPost = blogs[currentPostIndex + 1] ?? null;
  const prevPost = blogs[currentPostIndex - 1] ?? null;

  return {
    props: {
      blog: postData,
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
    path: '@db/blogsIndex.json',
    repo: 'mbaharip-blog-posts',
  })) as Partial<{ data: GithubFile }>;

  if (!data) return { notFound: true };

  const rawContent = Buffer.from(data.content, 'base64').toString('utf-8');
  const blogs = JSON.parse(rawContent) as Post[];

  const paths = blogs.map((blog) => ({
    params: { fileName: blog.path?.split('/').pop() },
  }));

  return {
    paths: paths ?? [],
    fallback: 'blocking',
  };
}
