import { BlockNoteEditor, BlockSpec, SpecificBlock } from '@blocknote/core';
import { ReactSlashMenuItem, createReactBlockSpec } from '@blocknote/react';
import { Button } from '@nextui-org/react';
import c_blocks from 'constant/blocks';
import { motion as m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Icon from 'components/Icons';

import { formatBytes } from 'utils/dataFormatter';

import { CustomBlockData, ExtendBlockSchema } from 'types/Blocks';
import { State } from 'types/Common';

import toastConfig from 'config/toast';

const PropSchema = {
  url: {
    default: '',
  },
  name: {
    default: '',
  },
  ext: {
    default: '',
  },
  size: {
    default: 0,
  },
};

export type FileSchema = ExtendBlockSchema<{
  file: BlockSpec<'file', typeof PropSchema, false>;
}>;

interface RenderProps {
  block: SpecificBlock<FileSchema, 'file'>;
  editor: BlockNoteEditor<FileSchema>;
  theme: 'light' | 'dark';
}
function Render(props: RenderProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadRef, setUploadRef] = useState<HTMLInputElement | null>(null);
  const [btnUploadState, setBtnUploadState] = useState<State>('disabled');

  useEffect(() => {
    if (uploadFile) {
      setBtnUploadState('idle');
    } else {
      setBtnUploadState('disabled');
    }
  }, [uploadFile]);

  if (!props.block.props.url && !props.editor.isEditable) return <></>;
  if (!props.block.props.url && props.editor.isEditable)
    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.75, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.25,
          ease: 'easeInOut',
          type: 'tween',
        }}
        className={'relative my-2 flex w-full items-center'}
      >
        <div className='flex w-full min-w-[256px] max-w-lg items-center gap-4 rounded-medium border-medium border-divider bg-background/25 px-3 py-2'>
          <Icon
            name='File'
            size='xl'
          />
          <div className='flex w-full flex-grow items-center justify-between gap-2'>
            <input
              type='file'
              hidden
              accept='*'
              ref={setUploadRef}
              onChange={(e) => {
                if (!e.target.files) return;
                const disallowTypes = ['image/', 'audio/', 'video/'];

                const file = e.target.files[0];
                const maxFileSize = 25 * 1024 * 1024; // 25MB
                const mimeType = file.type;
                if (file.size > maxFileSize) {
                  toast.error('File size is too large, please select a file smaller than 25MB');
                  return;
                }
                if (disallowTypes.some((type) => mimeType.startsWith(type))) {
                  toast.error('This file type is not supported');
                  return;
                }
                setUploadFile(file);
              }}
            />
            <div className='flex flex-grow flex-col items-start'>
              <span className='line-clamp-1 max-w-sm'>{uploadFile ? uploadFile.name : 'No file selected'}</span>
              <span className='text-tiny text-default-500'>
                {uploadFile ? formatBytes(uploadFile.size) : formatBytes(0)}
              </span>
            </div>
            <Button
              size='sm'
              variant='flat'
              className='flex-shrink-0'
              onPress={() => {
                if (uploadRef) uploadRef.click();
              }}
            >
              {uploadFile ? 'Change' : 'Select'} file
            </Button>
            <Button
              size='sm'
              variant='shadow'
              color='secondary'
              className='flex-shrink-0'
              isDisabled={btnUploadState === 'disabled'}
              isLoading={btnUploadState === 'loading'}
              onPress={async () => {
                const toastId = `uploadToast-${Date.now()}`;
                toast.loading('Uploading file...', {
                  toastId,
                  autoClose: false,
                });
                setBtnUploadState('loading');
                try {
                  if (!uploadFile) return;
                  if (!props.editor.uploadFile) throw new Error('Upload function is not defined');
                  const url = await props.editor.uploadFile(uploadFile);
                  if (!url) throw new Error('Upload function return empty url!');
                  props.editor.updateBlock(props.block, {
                    type: 'file',
                    props: {
                      url,
                      name: uploadFile.name,
                      ext: uploadFile.name.split('.').pop() ?? '',
                      size: uploadFile.size,
                    },
                  });

                  toast.update(toastId, {
                    render: 'Successfully upload image',
                    type: toast.TYPE.SUCCESS,
                    autoClose: toastConfig.autoClose,
                    delay: 150,
                    isLoading: false,
                  });
                } catch (error: any) {
                  console.error(error);
                  toast.update(toastId, {
                    render: (
                      <div className='flex flex-col'>
                        <span>Failed to upload image</span>
                        <span className='text-small text-default-500'>{error.message}</span>
                      </div>
                    ),
                    type: toast.TYPE.ERROR,
                    autoClose: toastConfig.autoClose,
                    delay: 150,
                    isLoading: false,
                  });
                } finally {
                  setBtnUploadState('idle');
                }
              }}
            >
              Upload
            </Button>
          </div>
        </div>
      </m.div>
    );

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 0.75, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.25,
        ease: 'easeInOut',
        type: 'tween',
      }}
      className={'relative my-2 flex w-full items-center'}
    >
      <div className='flex w-full min-w-[256px] max-w-lg items-center gap-4 rounded-medium border-medium border-primary bg-background/25 px-3 py-2'>
        <Icon
          name='File'
          size='xl'
        />
        <div className='flex w-full flex-grow items-center justify-between gap-2'>
          <div className='flex flex-grow flex-col items-start'>
            <span className='line-clamp-1 max-w-sm'>{uploadFile ? uploadFile.name : 'No file selected'}</span>
            <span className='text-tiny text-default-500'>
              {uploadFile ? formatBytes(uploadFile.size) : formatBytes(0)}
            </span>
          </div>
          <Button
            size='sm'
            variant='shadow'
            color='success'
            isIconOnly
            className='flex-shrink-0'
            onPress={() => {
              window.open(props.block.props.url, '_blank');
            }}
          >
            <Icon name='Download' />
          </Button>
        </div>
      </div>
    </m.div>
  );
}

const shortcut = undefined;
const keyword = undefined;
function createBlock(theme: 'light' | 'dark') {
  return createReactBlockSpec<'file', typeof PropSchema, false, FileSchema>({
    type: 'file' as const,
    propSchema: {
      url: {
        default: '',
      },
      ext: {
        default: '',
      },
      name: {
        default: '',
      },
      size: {
        default: 0,
      },
    },
    containsInlineContent: false,
    render: (props) => (
      <Render
        {...props}
        theme={theme}
      />
    ),
  });
}
const createSlashMenu: ReactSlashMenuItem<FileSchema> = {
  name: 'File',
  execute: (editor: BlockNoteEditor<FileSchema>) => {
    const block = editor.getTextCursorPosition().block;
    const blockIsEmpty = block.content!.length === 0;

    if (blockIsEmpty) {
      editor.updateBlock(block, { type: 'file' });
    } else {
      editor.insertBlocks(
        [
          {
            type: 'file',
          },
        ],
        editor.getTextCursorPosition().block,
        'after',
      );
    }
    editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!);
  },
  aliases: ['file', 'download', 'attachment', 'upload'],
  group: c_blocks.Media as const,
  icon: <Icon name='FilePlus' />,
  hint: 'Upload a file',
};

const blockData: CustomBlockData = {
  propSchema: PropSchema,
  components: Render,
  blockSchema: createBlock,
  slashMenu: createSlashMenu,
  shortcuts: shortcut,
  keywords: keyword,
};

export default blockData;
