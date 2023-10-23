import axios from 'axios';
import c from 'constant';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'GET') {
    response.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const _last_7_days = axios
      .get('https://wakatime.com/api/v1/users/current/stats/last_7_days', {
        headers: {
          Authorization: `Basic ${process.env.WAKA_API}`,
        },
      })
      .then((response) => response.data.data);
    const _all_time = axios
      .get('https://wakatime.com/api/v1/users/current/all_time_since_today', {
        headers: {
          Authorization: `Basic ${process.env.WAKA_API}`,
        },
      })
      .then((response) => response.data.data);

    const [last_7_days, all_time] = await Promise.all([_last_7_days, _all_time]);

    const data = {
      ...last_7_days,
      all_time,
    };

    response.setHeader(
      'Cache-Control',
      `public, s-maxage=${c.MAX_AGE}, max-age=${c.MAX_AGE}, stale-while-revalidate=${c.MAX_SWR}`,
    );
    return response.status(200).json(data);
  } catch (error: any) {
    return response.status(500).json({ message: error.message });
  }
}
