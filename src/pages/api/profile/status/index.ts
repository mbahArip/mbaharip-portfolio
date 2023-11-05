import { NextApiRequest, NextApiResponse } from 'next';

import supabase from 'utils/client/supabase';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const authorization = request.headers.authorization;
    if (!authorization) return response.status(401).json({ message: 'Unauthorized' });

    await supabase.auth.signInWithPassword({
      email: authorization,
      password: process.env.ADMIN_PASSWORD as string,
    });
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      return response.status(401).json({ message: 'Unauthorized' });
    }
    const { isHireable } = request.body as { isHireable: string };
    if (!isHireable) {
      return response.status(400).json({ message: 'One or more fields are missing' });
    }

    const res = await supabase
      .from('settings')
      .update({
        value: isHireable,
      })
      .match({
        id: 'isHireable',
      });
    if (res.error) {
      return response.status(500).json({ message: res.error.message, error: res.error });
    }

    return response.status(201).json({
      message: 'Success',
      data: res.data,
    });
  } catch (error: any) {
    return response.status(500).json({ message: error.message });
  }
}
