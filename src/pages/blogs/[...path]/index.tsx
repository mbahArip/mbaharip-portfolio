import { useRouter } from 'next/router';

export default function PageBlog() {
  const router = useRouter();
  const { path }: Partial<{ path: string[] }> = router.query;

  return (
    <div>
      <h1>{path?.join(' -> ')}</h1>
    </div>
  );
}
