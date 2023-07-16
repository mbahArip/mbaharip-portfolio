import { ImgHTMLAttributes, useEffect, useState } from 'react';
import ReactLoading from 'react-loading';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  renderAlt?: boolean;
  width?: number;
  height?: number;
  quality?: number;
}

export default function Img({
  src,
  alt,
  renderAlt = false,
  width = 256,
  height = 256,
  quality = 75,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    const ignoreDefault = ['/img/no-image.webp', '/img/timeout.webp'];
    let imageSource = src;
    if (ignoreDefault.includes(src)) return src;

    let type: 'attachments' | 'local' | 'url' = 'url';
    if (src.startsWith('@attachments')) {
      type = 'attachments';
      imageSource = `/api/sharp/${src}`;
    } else if (src.startsWith('/') || src.startsWith('@local')) {
      type = 'local';
      if (src.startsWith('@local')) {
        imageSource = `/api/sharp/${src}`;
      } else {
        imageSource = `/api/sharp/@local${src}`;
      }
    } else if (src.startsWith('http') || src.startsWith('@url')) {
      type = 'url';
      if (src.startsWith('@url')) {
        if (src.split('://').length > 1) {
          imageSource = `/api/sharp/@url/${src.split('://')[1]}`;
        } else {
          console.log('url', `/api/sharp/${src}`);
          imageSource = `/api/sharp/${src}`;
        }
      } else {
        imageSource = `/api/sharp/@url/${src.split('://')[1]}`;
      }
    } else {
      throw new Error(
        'Invalid image source. Must be either @attachments, (@local or /), or (@url or http(s)://)',
      );
    }

    const optimizedUrl = new URL(imageSource, process.env.NEXT_PUBLIC_SITE_URL);
    if (width) optimizedUrl.searchParams.append('width', width.toString());
    if (height) optimizedUrl.searchParams.append('height', height.toString());
    if (quality)
      optimizedUrl.searchParams.append('quality', quality.toString());

    return optimizedUrl.toString();
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);

    // Add timeout to prevent infinite loading and stop useEffect
    const timeout = setTimeout(() => {
      setImgSrc('/img/timeout.webp');
      setIsLoading(false);
      return;
    }, 5000);

    fetch(imgSrc)
      .then((res) => {
        if (!res.ok) throw new Error('error');

        return res.blob();
      })
      .then((blob) => {
        // convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          setImgSrc(base64data as string);
        };
      })
      .catch(() => {
        console.log('error');
        setImgSrc('/img/no-image.webp');
      })
      .finally(() => {
        setIsLoading(false);
        clearTimeout(timeout);
      });

    return () => {
      clearTimeout(timeout);
    };
  }, [imgSrc]);

  return (
    <>
      {isLoading ? (
        <div
          className={`grid border border-zinc-700 place-items-center ${
            props.className ?? ''
          }`}
        >
          <ReactLoading
            type='spin'
            width={16}
            height={16}
          />
          {/* <video
            autoPlay
            loop
            muted
            controls={false}
            className='w-full h-full'
          >
            <source
              src='/loading.webm'
              type='video/webm'
            />
          </video> */}
        </div>
      ) : (
        <figure className='w-fit h-fit flex flex-col gap-1 items-center justify-center flex-shrink-0 flex-grow-0'>
          <img
            src={imgSrc}
            alt={alt}
            loading={props.loading ?? 'lazy'}
            {...props}
          />
          {renderAlt && (
            <figcaption className='text-center text-sm text-zinc-500'>
              {alt}
            </figcaption>
          )}
        </figure>
      )}
    </>
  );
}
