import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { renderToString } from 'react-dom/server';

import MarkdownRender from 'components/MarkdownRender';

import supabase from 'utils/client/supabase';

import { DbCommentCreate } from 'types/Supabase';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      return response.status(401).json({ message: 'Unauthorized' });
    }

    // Check token;
    const body = new FormData();
    body.append(
      'secret',
      process.env.NODE_ENV === 'production'
        ? (process.env.RECAPTCHA_SECRET_KEY as string)
        : '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
    );
    body.append('response', token);
    const validity = await axios.post('https://www.google.com/recaptcha/api/siteverify', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (!validity.data.success) {
      return response.status(401).json({ message: 'Failed to verify Captcha' });
    }

    const { type, user_id, user_name, content, parent_id, reply_to, user_avatar, postId, is_me } =
      request.body as DbCommentCreate & {
        postId: string;
        type: 'projects' | 'blogs' | 'stuff';
      };
    if (!type || !postId || !user_id || !user_name || !content) {
      return response.status(400).json({ message: 'One or more fields are missing' });
    }

    const markdown = renderToString(<MarkdownRender isComments>{content}</MarkdownRender>);

    const res = await supabase
      .from('comments')
      .insert({
        user_id,
        user_name,
        user_avatar,
        content,
        parent_id,
        is_published: true,
        is_me,
        reply_to,
      })
      .select('*,reply_to:reply_to(*)')
      .single();
    if (res.error) {
      return response.status(500).json({ message: res.error.message, error: res.error });
    }
    let mapName = '';
    let value: Record<string, string> = {};
    switch (type) {
      case 'projects':
        mapName = 'map_project_comment';
        value = {
          project_id: postId,
          comment_id: res.data.id,
        };
        break;
      case 'blogs':
        mapName = 'map_blog_comment';
        value = {
          blog_id: postId,
          comment_id: res.data.id,
        };
        break;
      case 'stuff':
        mapName = 'map_stuff_comment';
        value = {
          stuff_id: postId,
          comment_id: res.data.id,
        };
        break;
      default:
        throw new Error('Invalid type');
    }
    const link = await supabase.from(mapName).insert(value);
    if (link.error) {
      await supabase.from('comments').delete().match({ id: res.data.id });
      return response.status(500).json({ message: link.error.message, error: link.error });
    }
    if (markdown.includes('comment-prohibited-identifier')) {
      await supabase
        .from('reported_comments')
        .insert({ comment_id: res.data.id, reported_by: 'System', reason: 'Markdown contains prohibited content' });
    }

    return response.status(201).json({
      message: 'Success',
      data: res.data,
    });
  } catch (error: any) {
    return response.status(500).json({ message: error.message });
  }
}
