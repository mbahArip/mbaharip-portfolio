import { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/octokit';

import { APIResponse } from 'types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const { data } = await octokit.rest.users.getByUsername({
      username: 'mbaharip',
    });

    const payload: APIResponse<any> = {
      status: 200,
      timestamp: Date.now(),
      data,
    };

    return res.status(payload.status).json(payload);
  } catch (error: any) {
    const payload: APIResponse = {
      status: error.status ?? error.code ?? 500,
      timestamp: Date.now(),
      error: {
        message: error.message,
        cause: error.cause ?? error.reason ?? 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    };

    return res.status(payload.status).json(payload);
  }
}
