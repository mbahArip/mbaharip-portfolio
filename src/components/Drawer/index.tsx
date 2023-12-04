import { TRANSITION_EASINGS } from '@nextui-org/framer-transitions';
import { Modal, ModalProps } from '@nextui-org/react';
import { twMerge } from 'tailwind-merge';

export const variant = (placement: 'left' | 'right') => ({
  enter: {
    // left: 0,
    opacity: 1,
    transition: {
      opacity: {
        duration: 0.4,
        ease: TRANSITION_EASINGS.ease,
      },
      left: {
        type: 'spring',
        bounce: 0,
        duration: 0.6,
      },
    },
  },
  exit: {
    // left: placement === 'left' ? '-100%' : '100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: TRANSITION_EASINGS.ease,
    },
  },
});

interface DrawerProps extends Omit<ModalProps, 'placement'> {
  placement?: 'left' | 'right';
}
export default function Drawer(props: DrawerProps) {
  const { placement, ...rest } = props;
  return (
    <Modal
      {...rest}
      radius='none'
      classNames={{
        wrapper: twMerge(
          'px-0 py-0 absolute top-0 overflow-hidden overflow-x-hidden',
          placement === 'left' ? 'justify-start' : 'justify-end',
        ),
        base: twMerge(
          'max-h-screen overflow-y-auto h-screen !m-0 rounded-none absolute top-0 transition-all ease-in-out !duration-500',
          placement === 'left' && props.isOpen ? 'left-0 right-auto' : '-left-full right-auto',
          placement === 'right' && props.isOpen ? 'right-0 left-auto' : '-right-full left-auto',
          // placement === 'left' ? 'left-0' : 'right-0',
        ),
      }}
      motionProps={{
        variants: variant(placement ?? 'left'),
      }}
    >
      {props.children}
    </Modal>
  );
}

Drawer.defaultProps = {
  placement: 'left',
};
