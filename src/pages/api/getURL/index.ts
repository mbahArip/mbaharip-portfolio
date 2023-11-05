import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';
import ogs from 'open-graph-scraper';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'GET') {
    response.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const url = request.query.url as string;
    const data = await ogs({ url });
    if (data.error) throw new Error(data.response);

    response.setHeader(
      'Cache-Control',
      `public, s-maxage=${c.MAX_AGE}, max-age=${c.MAX_AGE}, stale-while-revalidate=${c.MAX_SWR}`,
    );
    return response.status(200).json(data.result);
  } catch (error: any) {
    return response.status(500).json({ message: error.message });
  }
}
