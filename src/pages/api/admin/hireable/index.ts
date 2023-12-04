import { NextApiRequest, NextApiResponse } from 'next';

import supabaseServer from 'utils/client/supabase.server';

import { ApiResponseError, ApiResponseSuccess } from 'types/Common';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseSuccess<undefined> | ApiResponseError>,
) {
  const { method } = req;

  try {
    if (method !== 'GET') {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ message: 'Unauthorized', error: 'No token provided' });
      if (auth !== process.env.NEXT_PUBLIC_ADMIN_EMAIL)
        return res.status(401).json({ message: 'Unauthorized', error: 'Invalid token' });
    }

    switch (method) {
      case 'PUT':
        return await PUT(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    return res
      .status(isNaN(Number(error.code)) ? 500 : error.code)
      .json({ message: error.message, error: error.detail });
  }
}

async function PUT(req: NextApiRequest, res: NextApiResponse<ApiResponseSuccess<undefined> | ApiResponseError>) {
  const { hireable } = req.body as { hireable: boolean };

  const updateHireable = await supabaseServer
    .from('settings')
    .update({ value: String(hireable) })
    .match({ id: 'isHireable' });
  if (updateHireable.error)
    throw { code: 500, message: updateHireable.error.message, detail: updateHireable.error.details };

  return res.status(200).json({ message: 'Success' });
}
