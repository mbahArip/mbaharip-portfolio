import { BlockNoteEditor, BlockSpec, DefaultBlockSchema, PropSchema, SpecificBlock, defaultProps } from '@blocknote/core';
import { InlineContent, ReactSlashMenuItem, createReactBlockSpec } from '@blocknote/react';
import { motion as m } from 'framer-motion';

import Icon from 'components/Icons';

import c_blocks from 'constant/blocks';
import { CustomBlockData, ExtendBlockSchema } from 'types/Blocks';

const PropSchema = {
  ...defaultProps,
};

export type BlockquoteSchema = ExtendBlockSchema<{
  blockquote: BlockSpec<'blockquote', typeof PropSchema, true>;
}>;

interface RenderProps {
  block: SpecificBlock<BlockquoteSchema, 'blockquote'>;
  editor: BlockNoteEditor<BlockquoteSchema>;
  theme: 'light' | 'dark';
}
function Render(props: RenderProps) {
  return (
    <m.blockquote
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.25,
        ease: 'easeInOut',
        type: 'tween',
      }}
      className='w-full flex-grow border-l-4 border-primary bg-background/25 px-3 py-2 pl-5'
    >
      <InlineContent className='flex-grow' />
    </m.blockquote>
  );
}

const shortcut: CustomBlockData['shortcuts'] = {
  key: 'q',
  ctrlKey: true,
  shiftKey: true,
} as const;
const keyword = '> ' as const;
function createBlock(theme: 'light' | 'dark') {
  return createReactBlockSpec<'blockquote', typeof PropSchema, true, BlockquoteSchema>({
    type: 'blockquote' as const,
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      backgroundColor: defaultProps.backgroundColor,
    } as const,
    containsInlineContent: true,
    render: (props) => (
      <Render
        {...props}
        theme={theme}
      />
    ),
  })
}
const createSlashMenu: ReactSlashMenuItem<BlockquoteSchema> = {
  name: 'Blockquote',
  execute: (
    editor: BlockNoteEditor<
      DefaultBlockSchema & {
        blockquote: BlockSpec<'blockquote', typeof PropSchema, true>;
      }
    >,
  ) => {
    const block = editor.getTextCursorPosition().block;
    const blockIsEmpty = block.content!.length === 0;

    if (blockIsEmpty) {
      editor.updateBlock(block, { type: 'blockquote' });
    } else {
      editor.insertBlocks(
        [
          {
            type: 'blockquote',
          },
        ],
        editor.getTextCursorPosition().block,
      );
    }
  },
  aliases: ['blockquote', 'quote', 'bq'],
  group: c_blocks.Blocks as const,
  icon: <Icon name='Quote' />,
  hint: 'Quote some text',
  shortcut: `${shortcut.ctrlKey ? 'Ctrl+' : ''}${shortcut.shiftKey ? 'Shift+' : ''}${shortcut.key}`,
}

const blockData: CustomBlockData = {
  propSchema: PropSchema,
  components: Render,
  blockSchema: createBlock,
  slashMenu: createSlashMenu,
  shortcuts: shortcut,
  keywords: keyword,
};

export default blockData;
