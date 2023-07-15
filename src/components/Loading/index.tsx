import { useRouter } from 'next/router';

export default function Loading() {
  const router = useRouter();
  return (
    <div
      className='w-fit h-fit min-h-[25vh] max-h-[50vh] m-auto flex flex-1 items-center justify-center'
      key={`${router.asPath}`}
    >
      <video
        autoPlay
        loop
        muted
        className='w-24 h-24'
        controls={false}
      >
        <source
          src='/loading.webm'
          type='video/webm'
        />
      </video>
    </div>
  );
}
