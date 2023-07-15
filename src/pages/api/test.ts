import { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/octokit';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'test'
  ) {
    return res.status(404).json({ statusCode: 404, message: 'Not Found' });
  }

  try {
    const { data } = await octokit.rest.rateLimit.get();

    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ statusCode: 500, error });
  }
}
