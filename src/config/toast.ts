import { ToastContainerProps } from 'react-toastify';

const toastConfig: ToastContainerProps = {
  autoClose: 5000,
  position: 'bottom-right',
  limit: 3,
  theme: 'dark',
  pauseOnFocusLoss: false,
  pauseOnHover: false,
};

export default toastConfig;
