import { BlockNoteEditor, BlockSpec, SpecificBlock, defaultProps } from '@blocknote/core';
import { ReactSlashMenuItem, createReactBlockSpec } from '@blocknote/react';
import { Button, Image, Input, Popover, PopoverContent, PopoverTrigger, Tab, Tabs } from '@nextui-org/react';
import c_blocks from 'constant/blocks';
import { motion as m } from 'framer-motion';
import { Resizable } from 're-resizable';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';

import { CustomBlockData, ExtendBlockSchema } from 'types/Blocks';
import { State } from 'types/Common';

import toastConfig from 'config/toast';

const PropSchema = {
  textAlignment: defaultProps.textAlignment,
  url: {
    default: '',
  },
  alt: {
    default: '',
  },
  showCaption: {
    default: true,
  },
  width: {
    default: '100%',
  },
};

export type ImageSchema = ExtendBlockSchema<{
  img: BlockSpec<'img', typeof PropSchema, false>;
}>;

interface RenderProps {
  block: SpecificBlock<ImageSchema, 'img'>;
  editor: BlockNoteEditor<ImageSchema>;
  theme: 'light' | 'dark';
}
function Render(props: RenderProps) {
  const [maxWidth, setMaxWidth] = useState(props.block.props.width);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadRef, setUploadRef] = useState<HTMLInputElement | null>(null);
  const [uploadAlt, setUploadAlt] = useState<string>('');
  const [btnUploadState, setBtnUploadState] = useState<State>('idle');
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [embedUrlValid, setEmbedUrlValid] = useState<boolean>(false);
  const [embedAlt, setEmbedAlt] = useState<string>('');
  const [btnEmbedState, setBtnEmbedState] = useState<State>('idle');

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [imgCaption, setImgCaption] = useState<string>(props.block.props.alt);

  useEffect(() => {
    // check if embedUrl is an url
    if (!embedUrl) return setEmbedUrlValid(false);
    const url = new URL(embedUrl);
    setEmbedUrlValid(url.protocol === 'http:' || url.protocol === 'https:');
  }, [embedUrl]);
  useEffect(() => {
    if (embedUrlValid) {
      setBtnEmbedState('idle');
    } else {
      setBtnEmbedState('disabled');
    }
  }, [embedUrlValid]);

  const handleUpdateImageBlock = (url: string, alt: string) => {
    props.editor.updateBlock(props.block, {
      props: {
        ...props.block.props,
        url,
        alt,
      },
    });
    setImgCaption(alt);
  };

  if (!props.block.props.url && !props.editor.isEditable) return <></>;
  if (!props.block.props.url && props.editor.isEditable)
    return (
      <m.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.25,
          ease: 'easeInOut',
          type: 'tween',
        }}
        className='flex w-full min-w-[256px] max-w-screen-md flex-col items-start rounded-medium border-medium border-divider bg-background/25 px-3 py-2'
      >
        <Tabs
          aria-label='Upload file tab'
          fullWidth
          color='primary'
          variant='bordered'
          onSelectionChange={(e) => {
            const key = e;
            switch (key) {
              case 'upload':
                setUploadFile(null);
                setUploadAlt('');
                setBtnUploadState('disabled');
                break;
              case 'embed':
                setEmbedUrl('');
                setEmbedAlt('');
                setBtnEmbedState('disabled');
                break;
            }
          }}
        >
          <Tab
            key={'upload'}
            title={
              <div className='flex items-center gap-2'>
                <Icon
                  name='Upload'
                  size='sm'
                />
                <span>Upload Image</span>
              </div>
            }
            className='flex w-full flex-grow items-center gap-4'
          >
            <Image
              src={uploadFile ? URL.createObjectURL(uploadFile) : '/img/placeholder.webp'}
              alt={uploadAlt}
              fallbackSrc={'/img/not-found.webp'}
              removeWrapper
              className='aspect-square max-h-24 object-contain'
            />
            <div className='flex w-full flex-grow flex-col items-start gap-2'>
              <input
                ref={setUploadRef}
                type='file'
                hidden
                accept='image/*'
                onChange={(e) => {
                  if (!e.target.files) return;

                  const file = e.target.files[0];
                  const maxFileSize = 5 * 1024 * 1024; // 5MB
                  const mimeType = file.type;
                  if (file.size > maxFileSize) {
                    toast.error('File size is too large, please select a file smaller than 5MB');
                    return;
                  }
                  if (!mimeType.startsWith('image/')) {
                    toast.error('Invalid file type, please select an image file');
                    return;
                  }
                  setUploadFile(file);
                  setBtnUploadState('idle');
                }}
              />
              <div className='flex items-center gap-1'>
                <span className='line-clamp-1 max-w-sm'>{uploadFile?.name ?? 'No file selected'}</span>
                <Button
                  size='sm'
                  variant='flat'
                  onPress={() => {
                    if (!uploadRef) return;
                    uploadRef.click();
                  }}
                >
                  {uploadFile ? 'Change' : 'Select'} file
                </Button>
              </div>
              <Input
                fullWidth
                placeholder='Image alt text'
                variant='underlined'
                value={uploadAlt}
                onValueChange={setUploadAlt}
              />
              <Button
                size='sm'
                variant='shadow'
                color='secondary'
                fullWidth
                isDisabled={btnUploadState === 'disabled'}
                isLoading={btnUploadState === 'loading'}
                onPress={async () => {
                  const toastId = `uploadToast-${Date.now()}`;
                  toast.loading('Uploading image...', {
                    toastId,
                    autoClose: false,
                  });
                  setBtnUploadState('loading');
                  try {
                    if (!uploadFile) return;
                    if (!props.editor.uploadFile) throw new Error('Upload function are not defined!');
                    const url = await props.editor.uploadFile(uploadFile);
                    if (!url) throw new Error('Upload function return empty url!');
                    handleUpdateImageBlock(url, uploadAlt);

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
                Upload Image
              </Button>
            </div>
          </Tab>
          <Tab
            key={'embed'}
            className='w-full'
            title={
              <div className='flex items-center gap-2'>
                <Icon
                  name='Link'
                  size='sm'
                />
                <span>External Image</span>
              </div>
            }
          >
            <div className='flex w-full flex-grow flex-col gap-2'>
              <Input
                fullWidth
                placeholder='External image url'
                variant='underlined'
                value={embedUrl}
                onValueChange={setEmbedUrl}
                isInvalid={!embedUrlValid}
                errorMessage={!embedUrlValid ? 'Invalid image url' : ''}
              />
              <Input
                fullWidth
                placeholder='Image alt text'
                variant='underlined'
                value={embedAlt}
                onValueChange={setEmbedAlt}
              />
              <Button
                size='sm'
                variant='shadow'
                color='secondary'
                isDisabled={btnEmbedState === 'disabled'}
                isLoading={btnEmbedState === 'loading'}
                onPress={() => handleUpdateImageBlock(embedUrl, embedAlt)}
              >
                Add Embed Image
              </Button>
            </div>
          </Tab>
        </Tabs>
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
      className={twMerge(
        'relative my-2 flex w-full items-center',
        props.block.props.textAlignment === 'center'
          ? 'justify-center'
          : props.block.props.textAlignment === 'right'
          ? 'justify-end'
          : 'justify-start',
      )}
    >
      <Resizable
        defaultSize={{
          width: 250,
          height: '100%',
        }}
        minWidth={250}
        maxWidth={'75vw'}
        minHeight={125}
        bounds={'parent'}
        boundsByDirection={true}
        handleComponent={{
          left: (
            <div className='group relative left-0 z-40 my-auto h-full w-2'>
              <div className='relative top-1/2 h-unit-2xl w-2 -translate-y-1/2 transform rounded-full border border-default bg-foreground-500 shadow-small transition group-hover:bg-foreground-900'></div>
            </div>
          ),
          right: (
            <div className='group relative left-0 z-40 my-auto h-full w-2'>
              <div className='relative top-1/2 h-unit-2xl w-2 -translate-y-1/2 transform rounded-full border border-default bg-foreground-500 shadow-small transition group-hover:bg-foreground-900'></div>
            </div>
          ),
        }}
        handleStyles={{
          right: {
            cursor: 'ew-resize',
          },
        }}
        enable={{
          bottom: false,
          bottomLeft: false,
          bottomRight: false,
          left: props.editor.isEditable && props.block.props.textAlignment !== 'left',
          right: props.editor.isEditable && props.block.props.textAlignment !== 'right',
          top: false,
          topLeft: false,
          topRight: false,
        }}
        onResize={(_e, _dir, ref, _d) => {
          setMaxWidth(`${ref.offsetWidth}px`);
        }}
      >
        <div
          className={twMerge(
            'flex',
            props.block.props.textAlignment === 'center'
              ? 'justify-center'
              : props.block.props.textAlignment === 'right'
              ? 'justify-end'
              : 'justify-start',
          )}
        >
          <div className='relative flex flex-col items-center gap-2'>
            {props.editor.isEditable && (
              <Popover
                isOpen={isPopoverOpen}
                onOpenChange={setIsPopoverOpen}
                placement='bottom'
                classNames={{
                  base: 'px-3 py-2',
                }}
              >
                <PopoverTrigger>
                  <Button
                    size='sm'
                    isIconOnly
                    className='absolute right-2 top-2 z-10'
                  >
                    <Icon
                      name='Pencil'
                      size='sm'
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='flex flex-col gap-2'>
                  <Input
                    variant='underlined'
                    value={props.block.props.url}
                    placeholder='Image url'
                    isDisabled
                    readOnly
                    fullWidth
                  />
                  <Input
                    variant='underlined'
                    value={imgCaption}
                    onValueChange={setImgCaption}
                    placeholder='Image caption'
                    fullWidth
                  />

                  <Button
                    size='sm'
                    color='secondary'
                    variant='shadow'
                    fullWidth
                    onPress={() => {
                      handleUpdateImageBlock(props.block.props.url, imgCaption);
                      setIsPopoverOpen(false);
                    }}
                  >
                    Update Caption
                  </Button>
                  <Button
                    size='sm'
                    color='danger'
                    variant='flat'
                    fullWidth
                    onPress={() => {
                      setImgCaption(props.block.props.alt);
                      setIsPopoverOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </PopoverContent>
              </Popover>
            )}
            <Image
              src={props.block.props.url}
              alt={props.block.props.alt ?? 'Image without alt text'}
              className='relative z-0 bg-background/25'
              style={{
                maxWidth: maxWidth ?? '100%',
              }}
              fallbackSrc={'/img/not-found.webp'}
            />
            <span className='w-fit text-center text-tiny text-default-500'>{props.block.props.alt}</span>
          </div>
        </div>
      </Resizable>
    </m.div>
  );
}

const shortcut = undefined;
const keyword = undefined;
function createBlock(theme: 'light' | 'dark') {
  return createReactBlockSpec<'img', typeof PropSchema, false, ImageSchema>({
    type: 'img' as const,
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      url: {
        default: '',
      },
      alt: {
        default: '',
      },
      showCaption: {
        default: false,
      },
      width: {
        default: '100%',
      },
    } as const,
    containsInlineContent: false,
    render: (props) => (
      <Render
        {...props}
        theme={theme}
      />
    ),
  });
}
const createSlashMenu: ReactSlashMenuItem<ImageSchema> = {
  name: 'Image',
  execute: (editor: BlockNoteEditor<ImageSchema>) => {
    const block = editor.getTextCursorPosition().block;
    const blockIsEmpty = block.content!.length === 0;

    if (blockIsEmpty) {
      editor.updateBlock(block, { type: 'img' });
    } else {
      editor.insertBlocks(
        [
          {
            type: 'img',
          },
        ],
        editor.getTextCursorPosition().block,
        'after',
      );
    }
    editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!);
  },
  aliases: ['img', 'image'],
  group: c_blocks.Media as const,
  icon: <Icon name='ImagePlus' />,
  hint: 'Upload or embed an image',
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
