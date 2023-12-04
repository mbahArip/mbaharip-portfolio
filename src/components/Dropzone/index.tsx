import { Button, Image } from '@nextui-org/react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';

interface DropzoneProps {
  selectedFileState?: {
    selectedFile: File | undefined;
    setSelectedFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  };
  defaultValue?: string;
  dropzoneOptions?: DropzoneOptions;
  onClear?: () => void;
  classNames?: {
    base?: string;
    input?: string;
  };
}
export default function Dropzone(props: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles, isDragAccept, isDragReject, inputRef } =
    useDropzone({
      multiple: false,
      ...props.dropzoneOptions,
    });

  return (
    <div
      {...getRootProps()}
      data-slot='base'
      className={twMerge(
        'grid aspect-video h-40 w-full cursor-pointer place-items-center overflow-hidden rounded-medium border border-dashed border-default-200 bg-background/25 transition hover:bg-background/10',
        props.dropzoneOptions?.noClick && 'cursor-default',
        isDragAccept && 'cursor-grab border-success-200',
        isDragReject && 'cursor-no-drop border-danger-200',
        props.selectedFileState?.selectedFile && 'border-0',
        getRootProps().className,
        props.classNames?.base,
      )}
    >
      <input
        {...getInputProps()}
        data-slot='input'
        className={twMerge(getInputProps().className, props.classNames?.input)}
      />
      {props.selectedFileState?.selectedFile || props.defaultValue ? (
        <div className='relative flex h-full w-full'>
          <Button
            size='sm'
            isIconOnly
            variant='shadow'
            color='danger'
            className='absolute right-1 top-1 z-20'
            onPress={() => {
              props.selectedFileState?.setSelectedFile(undefined);
              props.onClear?.();
            }}
          >
            <Icon name='X' />
          </Button>
          <Image
            src={
              props.defaultValue
                ? props.defaultValue
                : props.selectedFileState?.selectedFile
                ? URL.createObjectURL(props.selectedFileState?.selectedFile)
                : undefined
            }
            alt={
              props.defaultValue
                ? props.defaultValue
                : props.selectedFileState?.selectedFile?.name || 'No file selected'
            }
            removeWrapper
            className='relative aspect-video h-full w-full rounded-medium object-cover object-center'
          />
        </div>
      ) : (
        <p className='text-center text-tiny text-default-500'>
          {isDragAccept
            ? 'Drop the file here'
            : isDragReject
            ? 'File type not accepted, sorry!'
            : 'Drag and drop file here or click here to select file'}
        </p>
      )}
    </div>
  );
}
