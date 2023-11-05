import { NextApiRequest } from 'next';

import supabase from 'utils/client/supabase';

export function isServer() {
  if (typeof window !== 'undefined') {
    throw new Error('This function is only available on the server');
  }
}
export function isClient() {
  if (typeof window === 'undefined') {
    throw new Error('This function is only available on the client');
  }
}

export async function checkSession(request: NextApiRequest): Promise<boolean> {
  isServer();
  const authorization = request.headers.authorization;
  if (!authorization) return false;

  await supabase.auth.signInWithPassword({
    email: authorization,
    password: process.env.ADMIN_PASSWORD as string,
  });
  const session = (await supabase.auth.getSession()).data.session;
  if (!session) return false;

  return true;
}
