import axios from 'axios';
import { Session } from 'next-auth';

export const swrFetcher = (url: string) => axios.get(url).then((res) => res.data);

export async function swrAdminMutator<T>(
  key: string,
  {
    arg,
  }: {
    arg: {
      method: 'POST' | 'PUT' | 'DELETE';
      session: Session | null;
      payload: T;
    };
  },
) {
  const { session, payload, method } = arg;
  if (!session || !session.user)
    throw { code: 401, message: 'Unauthorized', error: 'You must be logged in to perform this action' };
  if (session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL)
    throw { code: 401, message: 'Unauthorized', error: 'You must be logged in as admin to perform this action' };

  await axios(key, {
    method,
    data: payload,
    headers: {
      Authorization: session.user?.email,
    },
  }).catch((error) => {
    throw error;
  });
}
