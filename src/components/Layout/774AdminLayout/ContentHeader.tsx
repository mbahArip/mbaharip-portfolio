interface ContentHeaderProps {
  title: string;
  subtitle?: string;
  extraComponent?: React.ReactNode;
}
export default function ContentHeader(props: ContentHeaderProps) {
  return (
    <div className='flex w-full items-center gap-4 py-4 capitalize'>
      <div className='flex flex-grow items-center gap-4'>
        <h2>{props.title}</h2>
        {props.subtitle && <span className='text-default-500'>{props.subtitle}</span>}
      </div>
      {props.extraComponent}
    </div>
  );
}
