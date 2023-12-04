import { BlockNoteEditor, BlockSpec, SpecificBlock } from '@blocknote/core';
import { ReactSlashMenuItem, createReactBlockSpec } from '@blocknote/react';
import { Button, Image, Input } from '@nextui-org/react';
import axios from 'axios';
import c from 'constant';
import c_blocks from 'constant/blocks';
import { motion as m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Icon from 'components/Icons';
import Link from 'components/Link';

import { CustomBlockData, ExtendBlockSchema } from 'types/Blocks';
import { State } from 'types/Common';

import toastConfig from 'config/toast';

const PropSchema = {
  url: {
    default: '',
  },
  title: {
    default: '',
  },
  siteName: {
    default: '',
  },
  description: {
    default: '',
  },
  image: {
    default: '',
  },
};

export type EmbedURLSchema = ExtendBlockSchema<{
  embed_url: BlockSpec<'embed_url', typeof PropSchema, false>;
}>;

interface RenderProps {
  block: SpecificBlock<EmbedURLSchema, 'embed_url'>;
  editor: BlockNoteEditor<EmbedURLSchema>;
  theme: 'light' | 'dark';
}
function Render(props: RenderProps) {
  const [btnState, setBtnState] = useState<State>('disabled');
  const [url, setUrl] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    const urlValid = url.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/);
    if (urlValid) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [url]);
  useEffect(() => {
    if (isValid) {
      setBtnState('idle');
    } else {
      setBtnState('disabled');
    }
  }, [isValid]);

  if (!props.block.props.url && !props.editor.isEditable) return <></>;
  if (!props.block.props.url && props.editor.isEditable)
    return (
      <m.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 0.75, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.25,
          ease: 'easeInOut',
          type: 'tween',
        }}
        className={'relative my-2 flex w-full items-center'}
      >
        <div className='flex w-full min-w-[256px] max-w-lg flex-col items-center gap-2 rounded-medium border-medium border-divider bg-background/25 px-3 py-2'>
          <Input
            variant='underlined'
            placeholder='Enter URL'
            value={url}
            onValueChange={setUrl}
            isInvalid={!isValid}
            errorMessage={!isValid ? 'Invalid URL' : undefined}
            fullWidth
          />
          <Button
            fullWidth
            size='sm'
            variant='shadow'
            color='secondary'
            isDisabled={btnState === 'disabled'}
            isLoading={btnState === 'loading'}
            onPress={async () => {
              const toastId = `embedURL-${Date.now()}`;
              toast.loading('Fetching data...', {
                toastId,
                autoClose: false,
              });
              setBtnState('loading');
              try {
                const data = await axios
                  .get('/api/getURL', {
                    params: {
                      url,
                    },
                  })
                  .then((res) => res.data);
                const { ogTitle, ogDescription, ogSiteName, ogImage } = data;
                props.editor.updateBlock(props.block, {
                  type: 'embed_url',
                  props: {
                    url,
                    title: ogTitle,
                    description: ogDescription,
                    siteName: ogSiteName,
                    image: ogImage,
                  },
                });

                toast.update(toastId, {
                  render: 'Successfully embed URL',
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
                setBtnState('idle');
              }
            }}
          >
            Embed URL
          </Button>
        </div>
      </m.div>
    );

  return (
    <m.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 0.75, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.25,
        ease: 'easeInOut',
        type: 'tween',
      }}
      className={'relative my-2 flex w-full items-center'}
    >
      <Link
        href={props.block.props.url}
        isExternal
      >
        <div className='flex w-full min-w-[256px] max-w-screen-md items-center gap-4 rounded-medium border-medium border-divider bg-background/25 px-3 py-2'>
          <Image
            src={(props.block.props.image[0] as any).url || c.PLACEHOLDER_IMAGE}
            alt={props.block.props.title}
            radius='sm'
            width={Number((props.block.props.image[0] as any).width) || 1200}
            height={Number((props.block.props.image[0] as any).height) || 630}
            className='max-h-28 w-fit object-contain'
          />
          <div className='flex flex-col items-start'>
            <span className='font-bold text-primary'>{props.block.props.title}</span>
            <span className='text-tiny text-default-400'>{props.block.props.siteName}</span>
            <span className='line-clamp-2 text-small text-default-500'>{props.block.props.description}</span>
          </div>
        </div>
      </Link>
    </m.div>
  );
}

const shortcut = undefined;
const keyword = undefined;
function createBlock(theme: 'light' | 'dark') {
  return createReactBlockSpec<'embed_url', typeof PropSchema, false, EmbedURLSchema>({
    type: 'embed_url' as const,
    propSchema: {
      url: {
        default: '',
      },
      title: {
        default: '',
      },
      siteName: {
        default: '',
      },
      description: {
        default: '',
      },
      image: {
        default: '',
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
const createSlashMenu: ReactSlashMenuItem<EmbedURLSchema> = {
  name: 'Embed URL',
  execute: (editor: BlockNoteEditor<EmbedURLSchema>) => {
    const block = editor.getTextCursorPosition().block;
    const blockIsEmpty = block.content!.length === 0;

    if (blockIsEmpty) {
      editor.updateBlock(block, { type: 'embed_url' });
    } else {
      editor.insertBlocks(
        [
          {
            type: 'embed_url',
          },
        ],
        editor.getTextCursorPosition().block,
        'after',
      );
    }
    editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!);
  },
  aliases: ['embed', 'url', 'link'],
  group: c_blocks.Media as const,
  icon: <Icon name='Link' />,
  hint: 'Embed a URL',
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
