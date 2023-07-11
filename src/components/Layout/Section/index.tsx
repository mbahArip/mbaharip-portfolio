import { motion as m } from 'framer-motion';
import { ReactNode } from 'react';

type Props = {
  id: string;
  children: ReactNode;
};

export default function LayoutSection({ id, children }: Props) {
  const variants = {
    visible: {
      opacity: 1,
      y: 0,
    },
    hidden: {
      opacity: 0,
      y: 50,
    },
  };

  return (
    <m.section
      id={id}
      variants={variants}
      initial='hidden'
      animate='visible'
    >
      {children}
    </m.section>
  );
}
