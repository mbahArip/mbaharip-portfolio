import { Button, ButtonGroup } from '@nextui-org/react';
import { motion as m } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { ErrorToast, SuccessToast } from 'components/DetailedToast';
import Icon from 'components/Icons';
import MarkdownRender from 'components/MarkdownRender';

import uploadFile from 'utils/uploadFile';

import toastConfig from 'config/toast';

export default function MarkdownEditor() {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [content, setContent] = useState<string>('# Hello world');
  const [ref, setRef] = useState<HTMLTextAreaElement | null>(null);

  const handleChangeMode = (newMode: 'edit' | 'preview' | 'split') => {
    if (mode === newMode) return;
    setMode(newMode);
  };
  return (
    <div className='flex h-full w-full flex-grow flex-col overflow-y-auto overflow-x-hidden rounded-medium bg-content1'>
      <div
        id='med-toolbar'
        className='flex w-full bg-content1 p-3'
      >
        <ButtonGroup>
          <Button
            variant={mode === 'edit' ? 'shadow' : 'flat'}
            color={mode === 'edit' ? 'primary' : 'default'}
            isIconOnly
            onPress={() => handleChangeMode('edit')}
          >
            <Icon name='PanelRightInactive' />
          </Button>
          <Button
            variant={mode === 'split' ? 'shadow' : 'flat'}
            color={mode === 'split' ? 'primary' : 'default'}
            isIconOnly
            onPress={() => handleChangeMode('split')}
          >
            <Icon name='Columns' />
          </Button>
          <Button
            variant={mode === 'preview' ? 'shadow' : 'flat'}
            color={mode === 'preview' ? 'primary' : 'default'}
            isIconOnly
            onPress={() => handleChangeMode('preview')}
          >
            <Icon name='PanelLeftInactive' />
          </Button>
        </ButtonGroup>
      </div>

      <div className='flex h-full w-full flex-grow bg-content2'>
        <m.div
          initial={{ left: 0, width: '100%' }}
          animate={{
            left: mode === 'preview' ? '-100%' : 0,
            width: mode === 'preview' ? '0%' : mode === 'split' ? '50%' : '100%',
          }}
          transition={{ duration: 0.15 }}
          className='relative top-0 flex h-auto flex-grow overflow-x-hidden'
        >
          <textarea
            ref={setRef}
            className='w-full resize-none whitespace-pre-wrap bg-transparent p-3 focus:outline-none'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={async (e) => {
              e.preventDefault(); // Prevent default paste behavior
              if (!ref) {
                toast.error(
                  <ErrorToast
                    message='Failed to paste content'
                    details={'textarea ref is null'}
                  />,
                );
                return;
              }

              const selectionStart = ref.selectionStart ?? 0;
              const selectionEnd = ref.selectionEnd ?? 0;

              // Get type of paste data
              const dataType = e.clipboardData.types[0];

              if (e.clipboardData.types.includes('Files')) {
                const file = e.clipboardData.files[0];
                if (!file) return;
                if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
                  toast.error('Only support image file');
                  return;
                }
                toast.loading('Uploading image...', {
                  toastId: 'upload-image',
                  autoClose: false,
                });

                const url = await uploadFile(file);
                setContent((prev) => {
                  const newContent =
                    prev.slice(0, selectionStart) + `![${file.name}](${url})` + prev.slice(selectionEnd);
                  return newContent;
                });
                toast.update('upload-image', {
                  render: <SuccessToast message='Image uploaded' />,
                  autoClose: toastConfig.autoClose,
                });
              } else if (dataType === 'text/plain') {
                const text = e.clipboardData.getData(dataType);
                const isUrl = text.match(/(https?:\/\/[^\s]+)/g);
                const isImage = text.match(/(https?:\/\/[^\s]+(\.png|\.jpg|\.jpeg))/g);

                if (isImage && isUrl) {
                  setContent((prev) => {
                    const newContent = prev.slice(0, selectionStart) + `![](${text})` + prev.slice(selectionEnd);
                    return newContent;
                  });
                  return;
                } else if (!isImage && isUrl) {
                  setContent((prev) => {
                    const newContent = prev.slice(0, selectionStart) + `[](${text})` + prev.slice(selectionEnd);
                    return newContent;
                  });

                  return;
                }
                setContent((prev) => {
                  const newContent = prev.slice(0, selectionStart) + text + prev.slice(selectionEnd);
                  return newContent;
                });
              } else {
                toast.error('Only support text/plain and file');
              }
            }}
          />
        </m.div>
        <m.div
          initial={{ right: 0, width: '100%' }}
          animate={{
            right: mode === 'edit' ? '-100%' : 0,
            width: mode === 'edit' ? '0%' : mode === 'split' ? '50%' : '100%',
          }}
          transition={{ duration: 0.15 }}
          className='relative top-0 flex h-auto flex-grow overflow-x-hidden'
        >
          <MarkdownRender
            classNames={{
              content: 'w-full h-full p-3',
            }}
          >
            {content}
          </MarkdownRender>
        </m.div>
      </div>
    </div>
  );
}
