import { GetStaticPropsContext } from 'next';

import PostLayout from 'components/Layout/PostLayout';
import MarkdownRender from 'components/MarkdownRender';

import supabase from 'utils/client/supabase';
import { createPostId, getPostId } from 'utils/postIdHelper';

import { DbProjectResponse } from 'types/Supabase';

const text: string = `# A demo of \`react-markdown\`

\`react-markdown\` is a markdown component for React.

👉 Changes are re-rendered as you type.

👈 Try writing some markdown on the left.

## Overview

* Follows [CommonMark](https://commonmark.org)
* Optionally follows [GitHub Flavored Markdown](https://github.github.com/gfm/)
* Renders actual React elements instead of using \`dangerouslySetInnerHTML\`
* Lets you define your own components (to render \`MyHeading\` instead of \`'h1'\`)
* Has a lot of plugins

## Contents

Here is an example of a plugin in action
([\`remark-toc\`](https://github.com/remarkjs/remark-toc)).
**This section is replaced by an actual table of contents**.

## Syntax highlighting

Here is an example of a plugin to highlight code:
[\`rehype-highlight\`](https://github.com/rehypejs/rehype-highlight).

\`\`\`js
import React from 'react'
import ReactDOM from 'react-dom'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

const markdown = \`
# Your markdown here
\`

ReactDOM.render(
  <Markdown rehypePlugins={[rehypeHighlight]}>{markdown}</Markdown>,
  document.querySelector('#content')
)
\`\`\`

Pretty neat, eh?

## GitHub flavored markdown (GFM)

For GFM, you can *also* use a plugin:
[\`remark-gfm\`](https://github.com/remarkjs/react-markdown#use).
It adds support for GitHub-specific extensions to the language:
tables, strikethrough, tasklists, and literal URLs.

These features **do not work by default**.
👆 Use the toggle above to add the plugin.

| Feature    | Support              |
| --------- | ------------------- |
| CommonMark | 100%                 |
| GFM        | 100% w/ \`remark-gfm\` |

~~strikethrough~~

* [ ] task list
* [x] checked item

https://example.com

## HTML in markdown

⚠️ HTML in markdown is quite unsafe, but if you want to support it, you can
use [\`rehype-raw\`](https://github.com/rehypejs/rehype-raw).
You should probably combine it with
[\`rehype-sanitize\`](https://github.com/rehypejs/rehype-sanitize).

<blockquote>
  👆 Use the toggle above to add the plugin.
</blockquote>

## Components

You can pass components to change things:

\`\`\`js
import React from 'react'
import ReactDOM from 'react-dom'
import Markdown from 'react-markdown'
import MyFancyRule from './components/my-fancy-rule.js'

const markdown = \`
# Your markdown here
\`

ReactDOM.render(
  <Markdown
    components={{
      // Use h2s instead of h1s
      h1: 'h2',
      // Use a component instead of hrs
      hr(props) {
        const {node, ...rest} = props
        return <MyFancyRule {...rest} />
      }
    }}
  >
    {markdown}
  </Markdown>,
  document.querySelector('#content')
)
\`\`\`

> Block`;

interface ProjectDetailsProps {
  project: DbProjectResponse;
}
export default function ProjectDetails(props: ProjectDetailsProps) {
  return (
    <>
      <PostLayout
        seo={{
          title: props.project.title,
          description: props.project.summary,
        }}
        type='projects'
        data={props.project}
      >
        <MarkdownRender>{text}</MarkdownRender>
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
    .from('projects')
    .select('*, stacks:master_stack(*), comments:comments(*, reply_to:reply_to(*))')
    .match({
      id: postId,
    })
    .single();

  if (data.error) throw new Error(data.error.message);
  if (data.count === 0) return { notFound: true };

  const dataResponse: DbProjectResponse = {
    id: data.data.id,
    title: data.data.title,
    summary: data.data.summary,
    content: data.data.content,
    created_at: data.data.created_at,
    updated_at: data.data.updated_at,
    thumbnail_url: data.data.thumbnail_url,
    source_url: data.data.source_url ?? null,
    demo_url: data.data.demo_url ?? null,
    is_featured: data.data.is_featured,
    views: data.data.views,
    stacks: data.data.stacks,
    comments: data.data.comments,
  };

  return {
    props: {
      project: dataResponse,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const data = await supabase.from('projects').select('id,title');
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
