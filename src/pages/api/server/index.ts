import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;
  if (method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  const health = await fetch('https://server.mbaharip.com/api/health').then(
    (res) => res.json(),
  );
  const code = health.code;

  if (code !== 200) {
    return res.status(500).send('Internal server error');
  }

  return res.status(200).send('OK');
}
