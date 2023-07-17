import Giscus from '@giscus/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { VscArrowUp, VscChevronLeft, VscChevronRight } from 'react-icons/vsc';

import MarkdownRender from 'components/MarkdownRender';

import calculateReadingSpeed from 'utils/calculateReadingSpeed';
import formatDate from 'utils/formatDate';

import { Post, PostDetails, PostToC } from 'types/post';

type Props = {
  post: PostDetails;
  toc: PostToC[];
  nextPost?: Post;
  prevPost?: Post;
};

export default function PostContent({ post, toc, nextPost, prevPost }: Props) {
  const [isTOCVisible, setIsTOCVisible] = useState<boolean>(false);

  useEffect(() => {
    const tocElement = document.querySelector('#toc');
    if (!tocElement) {
      setIsTOCVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setIsTOCVisible(entry.isIntersecting);
    });
    observer.observe(tocElement);

    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <>
      <div className='w-full grid grid-cols-1 md:grid-rows-1 md:grid-cols-5 gap-y-4'>
        <section
          id='details'
          className='flex flex-col gap-2 border-b-2 pb-4 md:pb-0 md:border-b-0 border-zinc-700 h-fit md:sticky top-24'
        >
          <div className='grid grid-cols-2 md:grid-cols-1 gap-2'>
            <div className='flex flex-col gap-1'>
              <h6>Tags</h6>
              {post.metadata.tags.length === 0 ? (
                <span className='text-sm'>No tags</span>
              ) : (
                <div className='flex flex-wrap gap-1 items-center'>
                  {post.metadata.tags.map((tag) => (
                    <Link
                      href={`/blogs?q=${tag}`}
                      key={tag}
                      className='opacity-80 hover:opacity-100 transition transition-smooth'
                    >
                      <span className='badge text-sm'>{tag}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className='flex flex-col gap-1'>
              <h6>Read time</h6>
              <span className='text-sm'>
                {calculateReadingSpeed(post.content)}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-1 gap-2'>
            <div className='flex flex-col gap-1'>
              <h6>Created at</h6>
              <span className='text-sm'>
                {formatDate(post.metadata.createdAt, true)}
              </span>
            </div>
            <div className='flex flex-col gap-1'>
              <h6>Last updated at</h6>
              <span className='text-sm'>
                {formatDate(post.metadata.updatedAt, true)}
              </span>
            </div>
          </div>
        </section>
        <section
          id='content'
          className='md:col-span-4 md:px-4 md:border-l-2 md:border-zinc-700'
        >
          {toc.length === 0 ? (
            <></>
          ) : (
            <section
              id='toc'
              className='flex flex-col gap-4 px-4 py-2 bg-zinc-900 w-full rounded-lg my-4'
            >
              <h4>Table of contents</h4>

              <div className='flex flex-col gap-2 w-full flex-1 px-4'>
                {toc.map((item) => {
                  if (item.text.toLowerCase() === 'table of contents')
                    return null;
                  return (
                    <a
                      href={`#${item.slug}`}
                      key={item.slug}
                      className='opacity-80 hover:opacity-100 transition transition-smooth'
                      onClick={(e) => {
                        e.preventDefault();
                        const targetHeading = document.getElementById(
                          item.slug,
                        );
                        if (targetHeading) {
                          const headerOffset = 72;
                          const targetHeadingPos =
                            targetHeading.getBoundingClientRect().top;
                          const scrollPos =
                            targetHeadingPos + window.scrollY - headerOffset;

                          window.scrollTo({
                            top: scrollPos,
                            behavior: 'smooth',
                          });
                        }
                      }}
                    >
                      <span
                        className={`text-sm cursor-pointer`}
                        style={{
                          marginLeft: `${(item.level - 2) * 1}rem`,
                        }}
                      >
                        - {item.text}
                      </span>
                    </a>
                  );
                })}
                <a
                  href={`#comments`}
                  className='opacity-80 hover:opacity-100 transition transition-smooth'
                  onClick={(e) => {
                    e.preventDefault();
                    const targetHeading = document.getElementById('comments');
                    if (targetHeading) {
                      const headerOffset = 72;
                      const targetHeadingPos =
                        targetHeading.getBoundingClientRect().top;
                      const scrollPos =
                        targetHeadingPos + window.scrollY - headerOffset;

                      window.scrollTo({
                        top: scrollPos,
                        behavior: 'smooth',
                      });
                    }
                  }}
                >
                  <span className={`text-sm cursor-pointer`}>- Comments</span>
                </a>
              </div>
            </section>
          )}
          <MarkdownRender>{post.content}</MarkdownRender>
        </section>
      </div>

      <section
        id='side-toc'
        className={`h-screen max-w-xs w-full fixed top-0 right-0 hidden ml-auto md:flex z-0 items-center justify-center ${
          isTOCVisible
            ? 'opacity-0 translate-x-full pointer-events-none'
            : 'opacity-100 translate-x-0 pointer-events-auto'
        } transition-all transition-smooth`}
      >
        <div className='flex flex-col gap-4 px-4 py-2 bg-zinc-900 w-full rounded-l-lg'>
          <h6 className='text-center underline decoration-2 underline-offset-4'>
            Table of contents
          </h6>
          <div className='flex flex-col gap-2 w-full flex-1'>
            <a
              href={`#post-header`}
              className='opacity-80 hover:opacity-100 transition transition-smooth'
              onClick={(e) => {
                e.preventDefault();
                const targetHeading = document.getElementById('post-header');
                if (targetHeading) {
                  const headerOffset = 72;
                  const targetHeadingPos =
                    targetHeading.getBoundingClientRect().top;
                  const scrollPos =
                    targetHeadingPos + window.scrollY - headerOffset;

                  window.scrollTo({
                    top: scrollPos,
                    behavior: 'smooth',
                  });
                }
              }}
            >
              <span className={`text-sm cursor-pointer`}>
                - Top of the post
              </span>
            </a>
            {toc.map((item) => {
              if (item.text.toLowerCase() === 'table of contents') return null;
              return (
                <a
                  href={`#${item.slug}`}
                  key={item.slug}
                  className='opacity-80 hover:opacity-100 transition transition-smooth'
                  onClick={(e) => {
                    e.preventDefault();
                    const targetHeading = document.getElementById(item.slug);
                    if (targetHeading) {
                      const headerOffset = 72;
                      const targetHeadingPos =
                        targetHeading.getBoundingClientRect().top;
                      const scrollPos =
                        targetHeadingPos + window.scrollY - headerOffset;

                      window.scrollTo({
                        top: scrollPos,
                        behavior: 'smooth',
                      });
                    }
                  }}
                >
                  <span
                    className={`text-sm cursor-pointer`}
                    style={{
                      marginLeft: `${(item.level - 2) * 1}rem`,
                    }}
                  >
                    - {item.text}
                  </span>
                </a>
              );
            })}
            <a
              href={`#comments`}
              className='opacity-80 hover:opacity-100 transition transition-smooth'
              onClick={(e) => {
                e.preventDefault();
                const targetHeading = document.getElementById('comments');
                if (targetHeading) {
                  const headerOffset = 72;
                  const targetHeadingPos =
                    targetHeading.getBoundingClientRect().top;
                  const scrollPos =
                    targetHeadingPos + window.scrollY - headerOffset;

                  window.scrollTo({
                    top: scrollPos,
                    behavior: 'smooth',
                  });
                }
              }}
            >
              <span className={`text-sm cursor-pointer`}>- Comments</span>
            </a>
          </div>
        </div>
      </section>

      <hr />
      {nextPost || prevPost ? (
        <section
          id='post-footer'
          className='w-full grid grid-cols-2'
        >
          {prevPost ? (
            <Link
              href={prevPost.path ?? '#'}
              className='flex flex-col gap-1 items-start group'
            >
              <span className='text-sm text-zinc-500 group-hover:text-zinc-500 transition transition-smooth'>
                Previous post
              </span>
              <div className='w-fit flex items-center gap-1 text-zinc-300 group-hover:text-white transition transition-smooth relative'>
                <VscChevronLeft className='relative right-0 group-hover:right-1 transition-all transition-smooth' />
                <h5>{prevPost.title}</h5>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link
              href={nextPost.path ?? '#'}
              className='flex flex-col gap-1 items-end group'
            >
              <span className='text-sm text-zinc-500 group-hover:text-zinc-500 transition transition-smooth'>
                Next post
              </span>
              <div className='w-fit flex items-center gap-1 text-zinc-300 group-hover:text-white transition transition-smooth relative'>
                <h5>{nextPost.title}</h5>
                <VscChevronRight className='relative left-0 group-hover:left-1 transition-all transition-smooth' />
              </div>
            </Link>
          ) : (
            <div />
          )}
        </section>
      ) : (
        <></>
      )}

      <section
        id='comments'
        className='w-full my-4 z-0 relative'
        key={post.metadata.title}
      >
        <Giscus
          repo='mbaharip/mbaharip-blog-posts'
          repoId='R_kgDOJ5ghvQ'
          category='Comments'
          categoryId='DIC_kwDOJ5ghvc4CX03d'
          mapping='pathname'
          strict='0'
          reactionsEnabled='1'
          emitMetadata='0'
          inputPosition='bottom'
          theme='noborder_dark'
          lang='en'
          loading='lazy'
        />
      </section>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: isTOCVisible ? 0 : 1,
          scale: isTOCVisible ? 0 : 1,
          pointerEvents: isTOCVisible ? 'none' : 'auto',
        }}
        transition={{
          duration: 0.1,
          type: 'spring',
          damping: 20,
          stiffness: 500,
        }}
        id='to-top'
        className='fixed right-4 bottom-16 p-2 rounded-full bg-white text-black md:hidden grid place-items-center z-[10000]'
        onClick={() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }}
      >
        <VscArrowUp size={24} />
      </motion.div>
    </>
  );
}
