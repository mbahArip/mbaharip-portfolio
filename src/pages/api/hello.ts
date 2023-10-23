// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import octokit from 'utils/client/octokit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const data = await octokit.rest.repos
    .listForAuthenticatedUser({
      sort: 'full_name',
      direction: 'asc',
      type: 'owner',
      per_page: 250,
    })
    .then((response) =>
      response.data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
      })),
    );

  res.status(200).json(data);
}
