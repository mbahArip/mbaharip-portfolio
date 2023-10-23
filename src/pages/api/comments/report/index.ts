import { NextApiRequest, NextApiResponse } from 'next';

import supabase from 'utils/client/supabase';

import { DbReportCreate } from 'types/Supabase';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const { comment_id, reason, reported_by } = request.body as DbReportCreate;
    if (!comment_id || !reason || !reported_by) {
      return response.status(400).json({ message: 'One or more fields are missing' });
    }

    await supabase.from('reported_comments').insert({
      comment_id,
      reason,
      reported_by,
    });

    return response.status(201).json({
      message: 'Success',
      data: `${comment_id} reported`,
    });
  } catch (error: any) {
    return response.status(500).json({ message: error.message });
  }
}
