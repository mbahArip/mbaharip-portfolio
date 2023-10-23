import { LinkProps, Link as NextUILink } from '@nextui-org/react';
import NextLink from 'next/link';

export default function Link(props: LinkProps) {
  return (
    <NextUILink
      as={NextLink}
      {...props}
    />
  );
}
