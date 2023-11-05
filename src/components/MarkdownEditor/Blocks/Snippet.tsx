import { BlockNoteEditor, BlockSpec, SpecificBlock, defaultProps } from '@blocknote/core';
import { InlineContent, ReactSlashMenuItem, createReactBlockSpec } from '@blocknote/react';
import { Snippet } from '@nextui-org/react';
import c_blocks from 'constant/blocks';
import { motion as m } from 'framer-motion';

import Icon from 'components/Icons';

import { CustomBlockData, ExtendBlockSchema } from 'types/Blocks';

const PropSchema = {
  ...defaultProps,
};

export type SnippetSchema = ExtendBlockSchema<{
  snippet: BlockSpec<'snippet', typeof PropSchema, true>;
}>;

interface RenderProps {
  block: SpecificBlock<SnippetSchema, 'snippet'>;
  editor: BlockNoteEditor<SnippetSchema>;
  theme: 'light' | 'dark';
}
function Render(props: RenderProps) {
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
    >
      <Snippet
        variant='flat'
        symbol='>'
        onCopy={(value) => {
          const textToCopy = typeof value === 'string' ? value : value.join('\n');
          navigator.clipboard.writeText(textToCopy.replace('> ', ''));
        }}
        classNames={{
          pre: 'flex items-center gap-1',
        }}
      >
        <InlineContent />
      </Snippet>
    </m.div>
  );
}

const shortcut: CustomBlockData['shortcuts'] = {
  key: 'c',
  ctrlKey: true,
  altKey: true,
} as const;
const keyword = '` ' as const;
function createBlock(theme: 'light' | 'dark') {
  return createReactBlockSpec<'snippet', typeof PropSchema, true, SnippetSchema>({
    type: 'snippet' as const,
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
  });
}
const createSlashMenu: ReactSlashMenuItem<SnippetSchema> = {
  name: 'Snippet',
  execute: (editor: BlockNoteEditor<SnippetSchema>) => {
    const block = editor.getTextCursorPosition().block;
    const blockIsEmpty = block.content!.length === 0;

    if (blockIsEmpty) {
      editor.updateBlock(block, { type: 'snippet' });
    } else {
      editor.insertBlocks(
        [
          {
            type: 'snippet',
          },
        ],
        editor.getTextCursorPosition().block,
        'after',
      );
      editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!);
    }
  },
  aliases: ['snippet', 'code', 'inline code'],
  group: c_blocks.Blocks as const,
  icon: <Icon name='Code' />,
  hint: 'Insert a code snippet',
  shortcut: `${shortcut.ctrlKey ? 'Ctrl+' : ''}${shortcut.shiftKey ? 'Shift+' : ''}${shortcut.key}`,
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
