// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import supabaseServer from 'utils/client/supabase.server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const commentData = await supabaseServer.from('comments').select('*, post:posts(id,title)');
  if (commentData.error) return res.status(500).send(commentData.error);
  res.status(200).send(commentData.data);
}
