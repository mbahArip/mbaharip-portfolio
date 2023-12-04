import { Tooltip } from '@nextui-org/react';
import { LucideProps, icons } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface IconProps extends LucideProps {
  name: keyof typeof icons;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  tooltip?: string;
}

export default function Icon({ name, size = 'md', className, tooltip, ...rest }: IconProps) {
  const LucideIcon = icons[name];

  const DEFAULT_SIZE = 20;
  const SIZE_MAP = {
    xs: DEFAULT_SIZE * 0.625,
    sm: DEFAULT_SIZE * 0.75,
    md: DEFAULT_SIZE,
    lg: DEFAULT_SIZE * 1.25,
    xl: DEFAULT_SIZE * 1.5,
  };

  if (tooltip)
    return (
      <Tooltip content={tooltip}>
        <LucideIcon
          size={SIZE_MAP[size]}
          className={twMerge(
            'ease flex-shrink-0 flex-grow-0 transition-transform duration-150 motion-reduce:transition-none',
            className,
          )}
          {...rest}
        />
      </Tooltip>
    );

  return (
    <LucideIcon
      size={SIZE_MAP[size]}
      className={twMerge(
        'ease flex-shrink-0 flex-grow-0 transition-transform duration-150 motion-reduce:transition-none',
        className,
      )}
      {...rest}
    />
  );
}
