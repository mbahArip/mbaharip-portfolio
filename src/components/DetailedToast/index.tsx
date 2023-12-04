interface SuccessToastProps {
  message: string;
}
export function SuccessToast({ message }: SuccessToastProps) {
  return <span>{message}</span>;
}

interface ErrorToastProps {
  message: string;
  details?: string;
}
export function ErrorToast({ message, details }: ErrorToastProps) {
  return (
    <div className='flex flex-col'>
      <span>{message}</span>
      {details && <span className='text-small text-default-500'>{details}</span>}
    </div>
  );
}
