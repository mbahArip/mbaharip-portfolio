import { motion as m } from 'framer-motion';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function LayoutMain({ children }: Props) {
  const variants = {
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    hidden: {
      opacity: 0,
    },
  };

  return (
    <m.main
      variants={variants}
      initial='hidden'
      animate='visible'
    >
      {children}
    </m.main>
  );
}
