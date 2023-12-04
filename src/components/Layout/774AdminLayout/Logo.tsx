import { Image } from '@nextui-org/react';
import { twMerge } from 'tailwind-merge';

interface NanashiLogoProps {
  className?: string;
}

export default function NanashiLogo(props: NanashiLogoProps) {
  return (
    <div className={twMerge('w-full select-none', props.className)}>
      <Image
        src='/774.svg'
        alt='774Lab.'
        className='mb-4 h-8'
        radius='none'
        removeWrapper
      />
    </div>
  );
}
