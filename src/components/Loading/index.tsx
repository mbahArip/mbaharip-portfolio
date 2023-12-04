import { twMerge } from 'tailwind-merge';

interface LoadingProps {
  className?: string;
}
export default function Loading({ className }: LoadingProps) {
  return (
    <div className={twMerge('flex flex-grow flex-col items-center gap-0', className)}>
      <video
        className='w-28'
        autoPlay
        loop
        muted
      >
        <source
          src='/loading.webm'
          type='video/webm'
        />
      </video>
    </div>
  );
}
