import { BlockNoteEditor, BlockSpec, SpecificBlock, defaultProps } from '@blocknote/core';
import { ReactSlashMenuItem, createReactBlockSpec } from '@blocknote/react';
import c_blocks from 'constant/blocks';
import { motion as m } from 'framer-motion';

import Icon from 'components/Icons';

import { CustomBlockData, ExtendBlockSchema } from 'types/Blocks';

const PropSchema = {
  textColor: defaultProps.textColor,
};

export type HorizontalLineSchema = ExtendBlockSchema<{
  hr: BlockSpec<'hr', typeof PropSchema, false>;
}>;

interface RenderProps {
  block: SpecificBlock<HorizontalLineSchema, 'hr'>;
  editor: BlockNoteEditor<HorizontalLineSchema>;
  theme: 'light' | 'dark';
}
function Render(props: RenderProps) {
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
      className='my-2 h-1 w-full flex-grow bg-default'
      style={{
        backgroundColor: props.block.props.textColor === 'default' ? undefined : props.block.props.textColor,
      }}
    />
  );
}

const shortcut = undefined;
const keyword = '--- ' as const;
function createBlock(theme: 'light' | 'dark') {
  return createReactBlockSpec<'hr', typeof PropSchema, false, HorizontalLineSchema>({
    type: 'hr',
    propSchema: {
      textColor: defaultProps.textColor,
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
const createSlashMenu: ReactSlashMenuItem<HorizontalLineSchema> = {
  name: 'Horizontal Line',
  execute: (editor: BlockNoteEditor<HorizontalLineSchema>) => {
    const block = editor.getTextCursorPosition().block;
    const blockIsEmpty = block.content!.length === 0;

    if (blockIsEmpty) {
      editor.updateBlock(block, { type: 'hr' });
    } else {
      editor.insertBlocks(
        [
          {
            type: 'hr',
          },
        ],
        editor.getTextCursorPosition().block,
        'after',
      );
    }
    editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!);
  },
  aliases: ['hr', 'line', 'horizontal-line', 'divider'],
  group: c_blocks.Blocks as const,
  icon: <Icon name='SeparatorHorizontal' />,
  hint: 'Separate your content with a horizontal line',
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
