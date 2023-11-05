// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import supabase from 'utils/client/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const getTotalPostsTag = await supabase.from('master_tag').select('id,blogs:blogs(count),stuff:stuff(count)', {
    count: 'exact',
  });
  if (getTotalPostsTag.error) throw getTotalPostsTag.error;

  const mapCount = getTotalPostsTag.data.map((item) => {
    return {
      id: item.id,
      count: ((item.blogs[0] as any).count ?? 0) + ((item.stuff[0] as any).count ?? 0),
    };
  });

  res.status(200).json({ mapCount });
}
