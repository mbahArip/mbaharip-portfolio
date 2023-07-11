import { ReactNode } from 'react';

type Props = {
  style?: 'normal' | 'bold' | 'italic' | 'bold-italic';
  index?: number;
  className?: string;
  children: React.ReactNode;
};

export default function TextKey({
  style = 'bold',
  index = 0,
  className = '',
  children,
}: Props): ReactNode {
  const delay = index * 150;
  const elementMap = {
    'normal': (
      <span
        className={`animate-underline ${className}`}
        style={{ '--delay': `${delay}ms` } as React.CSSProperties}
      >
        {children}
      </span>
    ),
    'bold': (
      <strong
        className={`animate-underline ${className}`}
        style={{ '--delay': `${delay}ms` } as React.CSSProperties}
      >
        {children}
      </strong>
    ),
    'italic': (
      <em
        className={`animate-underline ${className}`}
        style={{ '--delay': `${delay}ms` } as React.CSSProperties}
      >
        {children}
      </em>
    ),
    'bold-italic': (
      <strong
        className={`animate-underline ${className}`}
        style={{ '--delay': `${delay}ms` } as React.CSSProperties}
      >
        <em>{children}</em>
      </strong>
    ),
  };
  const Render = elementMap[style];
  // Return the element
  return Render;
}
