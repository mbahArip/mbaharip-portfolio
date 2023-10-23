import { Button } from '@nextui-org/react';
import data404 from 'data/404';
import { useEffect, useState } from 'react';

import DefaultLayout from 'components/Layout/DefaultLayout';
import Link from 'components/Link';

import { Data404 } from 'types/Common';

export default function NotFound() {
  const [errorData, setErrorData] = useState<Data404>();

  useEffect(() => {
    const dataLength = data404.length;
    const randomIndex = Math.floor(Math.random() * dataLength);
    setErrorData(data404[randomIndex]);
  }, []);

  return (
    <DefaultLayout
      seo={{
        title: '404 Not Found',
      }}
    >
      <div className='flex h-full  flex-grow flex-col items-center justify-center gap-2'>
        <h2>404 Not Found</h2>
        <div className='flex flex-col text-center text-default-500'>
          <span>{errorData?.title}</span>
          <span>{errorData?.subtitle}</span>
        </div>
        <Button
          as={Link}
          href='/'
          color='primary'
          variant='light'
        >
          Back to Home
        </Button>
      </div>
    </DefaultLayout>
  );
}
