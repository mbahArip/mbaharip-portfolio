import { Button } from '@nextui-org/react';

import Link from 'components/Link';

interface ErrorPageProps {
  status: number;
  code?: string | number;
  name?: string;
  message?: string;
}

export default function ErrorPage(props: ErrorPageProps) {
  return (
    <div className='center-max-sm flex h-full w-full flex-grow flex-col items-center justify-center gap-2'>
      <h2>Client Error {props.status}</h2>
      <span className='text-tiny font-semibold text-default-500'>{[props.name, props.code].join(' - ')}</span>
      <p className='my-2 whitespace-pre-wrap text-center'>{props.message}</p>

      <div className='mt-8 flex items-center gap-2'>
        <Button
          as={Link}
          href='/'
          variant='shadow'
          color='primary'
        >
          Back to Home
        </Button>
        <Button
          variant='flat'
          onPress={() => {
            if (typeof window !== 'undefined') window.location.reload();
          }}
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
}
