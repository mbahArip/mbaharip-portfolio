import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

export default function MediaPath() {
  return null;
}

export async function getServerSideProps(contexts: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> {
  const { method } = contexts.req;
  switch (method) {
    case 'GET': {
      const { path } = contexts.params as { path: string[] };
      const res = await fetch(`https:/r2.mbaharip.com/${path.join('/')}`);
      if (res.status !== 200) return { notFound: true };
      const contentType = res.headers.get('content-type');
      const contentLength = res.headers.get('content-length');

      const buffer = new Uint8Array(await res.arrayBuffer());
      contexts.res.setHeader('Content-Type', contentType ?? 'application/octet-stream');
      contexts.res.setHeader('Content-Length', contentLength ?? 0);
      contexts.res.setHeader('Cache-Control', 'public, max-age=31536000, smax-age=31536000, immutable');
      contexts.res.setHeader('Content-Disposition', 'inline; filename=' + path[path.length - 1]);

      contexts.res.end(buffer);
      break;
    }
  }

  return { props: {} };
}
