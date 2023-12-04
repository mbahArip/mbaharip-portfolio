import { LinkProps, Link as NextUILink, TooltipProps } from '@nextui-org/react';
import NextLink from 'next/link';

export interface CustomLinkProps extends LinkProps {
  tooltip?: string;
  tooltipProps?: TooltipProps;
}
export default function Link(props: CustomLinkProps) {
  const { tooltip, tooltipProps, ...rest } = props;
  return (
    // <Tooltip
    //   content={tooltip ?? ''}
    //   isDisabled={!tooltip}
    //   {...tooltipProps}
    // >
    <NextUILink
      as={NextLink}
      {...rest}
    />
    // </Tooltip>
  );
}
