import { NextApiRequest, NextApiResponse } from 'next';
import { App, Octokit } from 'octokit';

import octokit from 'utils/octokit';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { data } = await octokit.rest.rateLimit.get();

    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ statusCode: 500, error });
  }
}
