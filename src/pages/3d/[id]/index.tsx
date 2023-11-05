import { Button, Divider, Image, Tooltip } from '@nextui-org/react';
import { GetStaticPropsContext } from 'next';

import Icon from 'components/Icons';
import PostLayout from 'components/Layout/PostLayout';
import Link from 'components/Link';
import MarkdownRender from 'components/MarkdownRender';

import supabase from 'utils/client/supabase';
import { createPostId, getPostId } from 'utils/postIdHelper';

import { DbStuffResponse } from 'types/Supabase';

interface ProjectDetailsProps {
  stuff: DbStuffResponse;
}
export default function ProjectDetails(props: ProjectDetailsProps) {
  return (
    <>
      <PostLayout
        seo={{
          title: props.stuff.title,
          description: props.stuff.summary,
        }}
        type='stuff'
        data={props.stuff}
      >
        <h4>Information</h4>
        <MarkdownRender>{props.stuff.information || 'No information'}</MarkdownRender>
        <Divider />
        {props.stuff.image_urls && (
          <>
            {props.stuff.image_urls.map((url, index) => (
              <div
                key={index}
                className='group relative h-full w-full'
              >
                <Image
                  src={url}
                  alt={props.stuff.title}
                  className='h-full w-full'
                  removeWrapper
                />
                <div className='absolute bottom-0 left-1/2 z-10 flex w-fit -translate-x-1/2 items-center gap-1 rounded-full border-medium border-divider bg-background/50 px-4 py-1 opacity-0 backdrop-blur transition-all group-hover:bottom-2 group-hover:opacity-100'>
                  <Tooltip content={'Download image'}>
                    <Button
                      isIconOnly
                      variant='light'
                      size='sm'
                      onPress={() => {
                        alert('download');
                      }}
                    >
                      <Icon name='Download' />
                    </Button>
                  </Tooltip>
                  <Tooltip content={'Open image in new tab'}>
                    <Button
                      isIconOnly
                      variant='light'
                      size='sm'
                      onPress={() => {
                        window.open(url, '_blank');
                      }}
                    >
                      <Icon name='ExternalLink' />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </>
        )}
        {props.stuff.video_urls && (
          <>
            {props.stuff.video_urls.map((url, index) => (
              <video
                key={index}
                src={url}
                controls
                playsInline
                className='rounded-medium'
              />
            ))}
          </>
        )}
        {props.stuff.sketchfab_url && (
          <div className='h-full w-full rounded-medium'>
            <iframe
              title='Defi Gauge'
              allowFullScreen
              allow='autoplay; fullscreen; xr-spatial-tracking'
              xr-spatial-tracking
              execution-while-out-of-viewport
              execution-while-not-rendered
              web-share
              className='h-[30vh] w-full rounded-medium sm:h-[45vh] md:h-[60vh] lg:h-[70vh]'
              src={`https://sketchfab.com/models/${props.stuff.sketchfab_url}/embed?ui_theme=dark`}
            ></iframe>
            <Link
              href={`https://sketchfab.com/3d-models/${props.stuff.sketchfab_url}?utm_medium=embed&utm_campaign=share-popup&utm_content=${props.stuff.sketchfab_url}`}
              isExternal
              showAnchorIcon
              className='ml-auto mt-1 flex w-fit items-center gap-1 text-small text-default-500'
            >
              View on <span className='font-bold text-[#1CAAD9]'>Sketchfab</span>
            </Link>
          </div>
        )}
      </PostLayout>
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const { id } = context.params || {};
  if (!id) return { notFound: true };

  const { id: postId, title } = getPostId(id as string);
  if (!postId || !title) return { notFound: true };

  const data = await supabase
    .from('stuff')
    .select('*, tags:master_tag(*), comments:comments(*, reply_to:reply_to(*))')
    .match({
      id: postId,
    })
    .single();

  if (data.error) throw new Error(data.error.message);
  if (data.count === 0) return { notFound: true };

  const dataResponse: DbStuffResponse = {
    id: data.data.id,
    created_at: data.data.created_at,
    updated_at: data.data.updated_at,
    title: data.data.title,
    summary: data.data.summary,
    thumbnail_url: data.data.thumbnail_url,
    views: data.data.views,
    is_nsfw: data.data.is_nsfw,
    image_urls: data.data.image_urls,
    video_urls: data.data.video_urls,
    sketchfab_url: data.data.sketchfab_url,
    information: data.data.information,
    tags: data.data.tags,
    comments: data.data.comments,
  };

  if (process.env.NODE_ENV === 'production') {
    await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL as string,
      password: process.env.ADMIN_PASSWORD as string,
    });
    if (await supabase.auth.getSession()) {
      await supabase
        .from('stuff')
        .update({ views: dataResponse.views + 1 })
        .match({
          id: dataResponse.id,
        });
    }
  }

  return {
    props: {
      stuff: dataResponse,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const data = await supabase.from('stuff').select('id,title');
  if (data.error) throw new Error(data.error.message);
  if (data.count === 0) return { notFound: true };

  const paths = data.data.map((project) => ({
    params: {
      id: createPostId(project.id, project.title),
    },
  }));

  return {
    paths: paths ?? [],
    fallback: 'blocking',
  };
}
