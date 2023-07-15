import { GetServerSidePropsContext } from 'next';
import { getServerSideSitemapLegacy } from 'next-sitemap';

import octokit from 'utils/octokit';

import { GithubFile } from 'types/github';
import { Post } from 'types/post';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const fetchBlogs = octokit.rest.repos.getContent({
    owner: 'mbaharip',
    path: '@db/blogsIndex.json',
    repo: 'mbaharip-blog-posts',
  });
  const fetchWorks = octokit.rest.repos.getContent({
    owner: 'mbaharip',
    path: '@db/worksIndex.json',
    repo: 'mbaharip-blog-posts',
  });
  const [{ data: blogs }, { data: works }] = await Promise.all([
    fetchBlogs,
    fetchWorks,
  ]).then(([blogs, works]) => {
    return [
      blogs as Partial<{ data: GithubFile }>,
      works as Partial<{ data: GithubFile }>,
    ];
  });

  if (!blogs || !works) return { notFound: true };

  const blogContent = Buffer.from(blogs.content, 'base64').toString('utf-8');
  const workContent = Buffer.from(works.content, 'base64').toString('utf-8');

  const blogIndex = JSON.parse(blogContent) as Post[];
  const workIndex = JSON.parse(workContent) as Post[];

  const blogPaths = blogIndex.map((blog) => ({
    loc: `https://www.mbaharip.com/blogs/${blog.path?.split('/').pop()}`,
    lastmod: new Date(blog.updatedAt).toISOString(),
  }));
  const workPaths = workIndex.map((work) => ({
    loc: `https://www.mbaharip.com/works/${work.path?.split('/').pop()}`,
    lastmod: new Date(work.updatedAt).toISOString(),
  }));

  const paths = [...blogPaths, ...workPaths];

  return getServerSideSitemapLegacy(ctx, paths);
}

// Default export to prevent next.js errors
export default function Sitemap() {}
