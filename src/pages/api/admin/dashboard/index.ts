import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';

import supabaseServer from 'utils/client/supabase.server';
import { parseMediaUrl } from 'utils/parser';

import { ApiResponseError, ApiResponseSuccess } from 'types/Common';

export interface APIDashboardResponse {
  totalPostsPerCategory: {
    id: string;
    title: string;
    count: number;
  }[];
  postsRankData: {
    id: string;
    title: string;
    views: number;
  }[];
  latestAttachmentsData: {
    id: number;
    name: string;
    url: string;
  }[];
  statsData: {
    tags: number;
    category: number;
  };
  latestCommentsData: {
    id: string;
    name: string;
    content: string;
    post: {
      id: string;
      title: string;
      category: string | null;
    };
    createdAt: string;
    updatedAt: string;
  }[];
  latestReportData: {
    id: number;
    name: string;
    reason: string;
    comment: {
      id: string;
    };
    createdAt: string;
    updatedAt: string;
  }[];
  latestMailData: {
    id: string;
    name: string;
    email: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseSuccess<APIDashboardResponse> | ApiResponseError>,
) {
  const { method } = req;
  if (method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const _totalPostsCategory = supabaseServer.from('posts').select('category:master_cat!inner(id, title)');
    const _postsRank = supabaseServer
      .from('posts')
      .select('*')
      .order('views', { ascending: false })
      .not('views', 'eq', 0)
      .limit(5);
    const _latestAttachments = supabaseServer
      .from('attachments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    const _totalTags = supabaseServer.from('master_tag').select('id', { count: 'exact' });
    const _totalCats = supabaseServer.from('master_cat').select('id', { count: 'exact' });
    const _latestComments = supabaseServer
      .from('comments')
      .select('*, post:posts!inner(id, title, category)')
      .order('created_at', { ascending: false })
      .limit(5);
    const _latestReport = supabaseServer
      .from('reports')
      .select('*, comment:comments!inner(id)')
      .order('created_at', { ascending: false })
      .limit(5);
    const _latestMail = supabaseServer
      .from('mail')
      .select('*')
      .order('created_at', { ascending: false })
      .not('is_replied', 'eq', true)
      .limit(5);

    const [
      totalPostsCategory,
      postsRank,
      latestAttachments,
      totalTags,
      totalCats,
      latestComments,
      latestReport,
      latestMail,
    ] = await Promise.all([
      _totalPostsCategory,
      _postsRank,
      _latestAttachments,
      _totalTags,
      _totalCats,
      _latestComments,
      _latestReport,
      _latestMail,
    ]);
    if (totalPostsCategory.error) throw totalPostsCategory.error;
    if (postsRank.error) throw postsRank.error;
    if (latestAttachments.error) throw latestAttachments.error;
    if (totalTags.error) throw totalTags.error;
    if (totalCats.error) throw totalCats.error;
    if (latestComments.error) throw latestComments.error;
    if (latestReport.error) throw latestReport.error;
    if (latestMail.error) throw latestMail.error;

    const countPostsPerCategory = totalPostsCategory.data.reduce((acc, curr) => {
      if (!curr.category) return acc;
      const cat = curr.category?.id;
      if (acc[cat]) acc[cat] += 1;
      else acc[cat] = 1;
      return acc;
    }, {} as Record<string, number>);
    const totalPostsPerCategory = Object.keys(countPostsPerCategory).map((key) => ({
      id: key,
      title: totalPostsCategory.data.find((cat) => cat.category?.id === key)?.category?.title || '',
      count: countPostsPerCategory[key],
    }));
    const postsRankData = postsRank.data.map((post) => ({
      id: post.id,
      title: post.title,
      views: post.views,
    }));
    const latestAttachmentsData = latestAttachments.data.map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      url: parseMediaUrl(attachment),
    }));
    const statsData = {
      tags: totalTags.count || 0,
      category: totalCats.count || 0,
    };
    const latestCommentsData = latestComments.data.map((comment) => ({
      id: comment.id,
      name: comment.name,
      content: comment.content,
      post: comment.post[0],
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    }));
    const latestReportData = latestReport.data.map((report) => ({
      id: report.id,
      name: report.name,
      reason: report.reason,
      comment: report.comment!,
      createdAt: report.created_at,
      updatedAt: report.updated_at,
    }));
    const latestMailData = latestMail.data.map((mail) => ({
      id: mail.id,
      name: mail.from_name,
      email: mail.from_mail,
      content: mail.content,
      createdAt: mail.created_at,
      updatedAt: mail.updated_at,
    }));

    res.setHeader('Cache-Control', `public, stale-while-revalidate=${c.MAX_SWR}, s-maxage=${c.MAX_AGE}`);

    return res.status(200).json({
      message: 'Success',
      data: {
        totalPostsPerCategory,
        postsRankData,
        latestAttachmentsData,
        statsData,
        latestCommentsData,
        latestReportData,
        latestMailData,
      },
    });
  } catch (error: any) {
    return res
      .status(isNaN(Number(error.code)) ? 500 : error.code)
      .json({ message: 'Internal server error', error: error.message });
  }
}
