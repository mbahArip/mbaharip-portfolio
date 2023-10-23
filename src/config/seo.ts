import { DefaultSeoProps } from 'next-seo';

const defaultSEO: DefaultSeoProps = {
  titleTemplate: '%s | mbahArip',
  defaultTitle: 'mbahArip',
  description:
    "Hello, I'm Arief Rachmawan, a developer based in Bandung, Indonesia. On this site, you'll find my projects, blog posts, and more.",
  canonical: process.env.NEXT_PUBLIC_DOMAIN,
  openGraph: {
    title: 'mbahArip',
    description:
      "Hello, I'm Arief Rachmawan, a developer based in Bandung, Indonesia. On this site, you'll find my projects, blog posts, and more.",
    url: process.env.NEXT_PUBLIC_DOMAIN,
    siteName: 'mbahArip',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_DOMAIN}/images/og-image.webp`,
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    cardType: 'summary_large_image',
  },
  facebook: {
    appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID as string,
  },
  additionalMetaTags: [
    {
      name: 'twitter:title',
      content: 'mbahArip',
    },
    {
      name: 'twitter:description',
      content:
        "Hello, I'm Arief Rachmawan, a developer based in Bandung, Indonesia. On this site, you'll find my projects, blog posts, and more.",
    },
    {
      name: 'twitter:image',
      content: `${process.env.NEXT_PUBLIC_DOMAIN}/images/og-image.webp`,
    },
  ],
};

export default defaultSEO;
