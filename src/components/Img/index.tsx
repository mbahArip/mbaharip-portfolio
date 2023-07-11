import { ImgHTMLAttributes, useEffect, useState } from 'react';
import ReactLoading from 'react-loading';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  renderAlt?: boolean;
  width?: number;
  height?: number;
  quality?: number;
  scale?: number;
}

export default function Img({
  src,
  alt,
  renderAlt = false,
  width = 256,
  height = 256,
  quality = 75,
  scale,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    let img = src;
    let _imgSrc = src;
    if (src.startsWith('https://') || src.startsWith('http://')) {
      _imgSrc = src.split('://')[1];
    }
    if (_imgSrc.startsWith('/api/attachments/')) {
      _imgSrc = _imgSrc.replace('/api/', '');
    }
    if (_imgSrc.startsWith('/img/')) {
      _imgSrc = _imgSrc.replace('/img/', '/local/img/');
    }
    img = _imgSrc;
    if (width) {
      _imgSrc = `${_imgSrc}?width=${width}`;
    }
    if (height) {
      // check if query string already exists
      if (_imgSrc.includes('?')) {
        _imgSrc = `${_imgSrc}&height=${height}`;
      } else {
        _imgSrc = `${_imgSrc}?height=${height}`;
      }
    }
    // Scale are priority over width and height
    // If scale is provided, width and height will be ignored
    if (scale) {
      _imgSrc = `${img}?scale=${scale}`;
    }
    if (quality) {
      // check if query string already exists
      if (_imgSrc.includes('?')) {
        _imgSrc = `${_imgSrc}&quality=${quality}`;
      } else {
        _imgSrc = `${_imgSrc}?quality=${quality}`;
      }
    }

    return `/api/optimize/${_imgSrc}`;
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
        <figure className='w-fit h-fit flex flex-col gap-1 items-center justify-center'>
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
